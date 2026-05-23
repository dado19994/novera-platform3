<?php

namespace Tests\Feature;

use App\Models\Collaboration;
use App\Models\Collective;
use App\Models\Conversation;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_direct_conversation_and_send_text_message(): void
    {
        [$sender, $recipient] = [User::factory()->create(), User::factory()->create()];

        $response = $this->withToken($sender->createToken('test')->plainTextToken)
            ->postJson('/api/conversations', [
                'type' => 'direct',
                'participant_ids' => [$recipient->id],
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Conversation created.')
            ->assertJsonPath('conversation.type', 'direct')
            ->assertJsonCount(2, 'conversation.participants');

        $conversationId = $response->json('conversation.id');

        $this->withToken($sender->createToken('send')->plainTextToken)
            ->postJson('/api/conversations/'.$conversationId.'/messages', [
                'type' => 'text',
                'body' => 'Hello from Novera.',
            ])->assertCreated()
            ->assertJsonPath('message', 'Message sent.')
            ->assertJsonPath('data.body', 'Hello from Novera.')
            ->assertJsonPath('data.type', 'text');

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversationId,
            'user_id' => $sender->id,
            'type' => 'text',
            'body' => 'Hello from Novera.',
        ]);
    }

    public function test_only_participants_can_read_or_write_messages(): void
    {
        [$sender, $recipient, $outsider] = [
            User::factory()->create(),
            User::factory()->create(),
            User::factory()->create(),
        ];

        $conversation = Conversation::query()->create(['type' => 'direct', 'status' => 'active']);
        $conversation->participants()->attach([
            $sender->id => ['role' => 'owner', 'status' => 'active'],
            $recipient->id => ['role' => 'member', 'status' => 'active'],
        ]);

        $this->withToken($outsider->createToken('test')->plainTextToken)
            ->getJson('/api/conversations/'.$conversation->id.'/messages')
            ->assertForbidden();

        $this->withToken($outsider->createToken('test-two')->plainTextToken)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'type' => 'text',
                'body' => 'No access.',
            ])->assertForbidden();
    }

    public function test_group_conversation_supports_optional_references_and_invite_message_types(): void
    {
        $owner = User::factory()->create();
        $memberA = User::factory()->create();
        $memberB = User::factory()->create();
        $collective = Collective::factory()->create(['owner_user_id' => $owner->id]);
        $event = Event::factory()->create(['organizer_user_id' => $owner->id, 'collective_id' => $collective->id]);
        $collaboration = Collaboration::query()->create([
            'user_id' => $owner->id,
            'collective_id' => $collective->id,
            'event_id' => $event->id,
            'title' => 'Invite collaborators',
            'description' => 'A private invite context.',
            'type' => 'open_creative_call',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
        ]);

        $response = $this->withToken($owner->createToken('test')->plainTextToken)
            ->postJson('/api/conversations', [
                'type' => 'group',
                'subject' => 'Project circle',
                'participant_ids' => [$memberA->id, $memberB->id],
                'collaboration_id' => $collaboration->id,
                'event_id' => $event->id,
                'collective_id' => $collective->id,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('conversation.type', 'group')
            ->assertJsonPath('conversation.subject', 'Project circle')
            ->assertJsonPath('conversation.collaboration_id', $collaboration->id)
            ->assertJsonPath('conversation.event_id', $event->id)
            ->assertJsonPath('conversation.collective_id', $collective->id)
            ->assertJsonCount(3, 'conversation.participants');

        $conversationId = $response->json('conversation.id');

        $this->withToken($owner->createToken('invite')->plainTextToken)
            ->postJson('/api/conversations/'.$conversationId.'/messages', [
                'type' => 'collaboration_invite',
                'body' => 'Join this call?',
                'collaboration_id' => $collaboration->id,
            ])->assertCreated()
            ->assertJsonPath('data.type', 'collaboration_invite')
            ->assertJsonPath('data.metadata.collaboration_id', $collaboration->id);
    }

    public function test_participant_can_list_conversations_and_fetch_messages_marks_read_state(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $conversation = Conversation::query()->create(['type' => 'direct', 'status' => 'active', 'last_message_at' => now()]);
        $conversation->participants()->attach([
            $sender->id => ['role' => 'owner', 'status' => 'active'],
            $recipient->id => ['role' => 'member', 'status' => 'active'],
        ]);
        $message = $conversation->messages()->create([
            'user_id' => $sender->id,
            'type' => 'text',
            'status' => 'sent',
            'body' => 'Read me.',
        ]);
        $conversation->update(['last_message_id' => $message->id]);

        $this->withToken($recipient->createToken('list')->plainTextToken)
            ->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath('conversations.data.0.id', $conversation->id)
            ->assertJsonPath('conversations.data.0.last_message.body', 'Read me.');

        $this->withToken($recipient->createToken('read')->plainTextToken)
            ->getJson('/api/conversations/'.$conversation->id.'/messages')
            ->assertOk()
            ->assertJsonPath('messages.data.0.body', 'Read me.');

        $this->assertDatabaseHas('conversation_participants', [
            'conversation_id' => $conversation->id,
            'user_id' => $recipient->id,
            'last_read_message_id' => $message->id,
        ]);
    }

    public function test_participant_cannot_send_another_users_media_in_a_message(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $foreignMedia = MediaItem::factory()->create(['user_id' => $recipient->id]);
        $conversation = Conversation::query()->create(['type' => 'direct', 'status' => 'active']);
        $conversation->participants()->attach([
            $sender->id => ['role' => 'owner', 'status' => 'active'],
            $recipient->id => ['role' => 'member', 'status' => 'active'],
        ]);

        $this->withToken($sender->createToken('sender')->plainTextToken)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'type' => 'text',
                'body' => 'Borrowed attachment.',
                'media_item_id' => $foreignMedia->id,
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('media_item_id');

        $this->assertDatabaseMissing('messages', ['media_item_id' => $foreignMedia->id]);
    }
}
