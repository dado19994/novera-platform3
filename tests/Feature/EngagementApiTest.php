<?php

namespace Tests\Feature;

use App\Models\Collaboration;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EngagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_react_to_allowed_entities_without_public_counts(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['status' => 'published', 'visibility' => 'public']);

        $response = $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/reactions', [
                'entity_type' => 'posts',
                'entity_id' => $post->id,
                'type' => 'inspired',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Reaction saved.')
            ->assertJsonPath('engagement.has_reacted', true)
            ->assertJsonPath('engagement.reaction.type', 'inspired')
            ->assertJsonMissingPath('engagement.reaction.count')
            ->assertJsonMissingPath('engagement.counts');

        $this->assertDatabaseHas('reactions', [
            'user_id' => $user->id,
            'reactionable_type' => Post::class,
            'reactionable_id' => $post->id,
            'type' => 'inspired',
        ]);
    }

    public function test_user_cannot_remove_another_users_reaction(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $track = Track::factory()->create(['user_id' => $owner->id]);
        $reaction = $track->reactions()->create([
            'user_id' => $owner->id,
            'type' => 'future_classic',
            'status' => 'active',
        ]);

        $this->withToken($other->createToken('other')->plainTextToken)
            ->deleteJson('/api/reactions/'.$reaction->id)
            ->assertForbidden();
    }

    public function test_user_can_remove_their_own_reaction(): void
    {
        $owner = User::factory()->create();
        $track = Track::factory()->create(['user_id' => $owner->id]);
        $reaction = $track->reactions()->create([
            'user_id' => $owner->id,
            'type' => 'future_classic',
            'status' => 'active',
        ]);

        $this->withToken($owner->createToken('owner')->plainTextToken)
            ->deleteJson('/api/reactions/'.$reaction->id)
            ->assertOk()
            ->assertJsonPath('message', 'Reaction removed.')
            ->assertJsonPath('engagement.has_reacted', false);

        $this->assertDatabaseMissing('reactions', ['id' => $reaction->id]);
    }

    public function test_user_can_save_and_list_supported_entities(): void
    {
        $user = User::factory()->create();
        $profileUser = User::factory()->create();
        $profile = Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $profileUser->id,
        ]);

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/saved', [
                'entity_type' => 'profiles',
                'entity_id' => $profile->id,
                'type' => 'save_vibe',
                'collection_name' => 'Rome inspirations',
            ])->assertCreated()
            ->assertJsonPath('message', 'Item saved.')
            ->assertJsonPath('engagement.is_saved', true)
            ->assertJsonPath('engagement.saved_item.entity_type', 'profiles')
            ->assertJsonPath('engagement.saved_item.collection_name', 'Rome inspirations');

        $this->withToken($user->createToken('list')->plainTextToken)
            ->getJson('/api/saved')
            ->assertOk()
            ->assertJsonPath('saved.data.0.entity_type', 'profiles')
            ->assertJsonPath('saved.data.0.entity.handle', $profile->handle)
            ->assertJsonMissingPath('saved.data.0.public_save_count');
    }

    public function test_user_cannot_remove_another_users_saved_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $event = Event::factory()->create();
        $saved = $event->savedItems()->create([
            'user_id' => $owner->id,
            'type' => 'save',
            'status' => 'active',
        ]);

        $this->withToken($other->createToken('other')->plainTextToken)
            ->deleteJson('/api/saved/'.$saved->id)
            ->assertForbidden();
    }

    public function test_user_can_remove_their_own_saved_item(): void
    {
        $owner = User::factory()->create();
        $event = Event::factory()->create();
        $saved = $event->savedItems()->create([
            'user_id' => $owner->id,
            'type' => 'save',
            'status' => 'active',
        ]);

        $this->withToken($owner->createToken('owner')->plainTextToken)
            ->deleteJson('/api/saved/'.$saved->id)
            ->assertOk()
            ->assertJsonPath('message', 'Saved item removed.')
            ->assertJsonPath('engagement.is_saved', false);

        $this->assertDatabaseMissing('saved_items', ['id' => $saved->id]);
    }

    public function test_all_allowed_entity_types_can_be_saved_or_reacted_to(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $media = MediaItem::factory()->create(['user_id' => $owner->id]);
        Post::factory()->create([
            'user_id' => $owner->id,
            'primary_media_item_id' => $media->id,
            'status' => 'published',
            'visibility' => 'public',
        ]);
        $track = Track::factory()->create(['user_id' => $owner->id]);
        $event = Event::factory()->create(['organizer_user_id' => $owner->id]);
        $collaboration = Collaboration::query()->create([
            'user_id' => $owner->id,
            'title' => 'Soft engagement call',
            'description' => 'Testing engagement.',
            'type' => 'open_creative_call',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        foreach ([
            ['media_items', $media->id, 'rare'],
            ['tracks', $track->id, 'future_classic'],
            ['events', $event->id, 'want_to_see_live'],
            ['collaborations', $collaboration->id, 'want_to_collaborate'],
        ] as [$entityType, $entityId, $reactionType]) {
            $this->withToken($token)->postJson('/api/reactions', [
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'type' => $reactionType,
            ])->assertCreated()
                ->assertJsonPath('engagement.reaction.entity_type', $entityType);
        }
    }

    public function test_user_cannot_save_or_react_to_inaccessible_entities_or_media(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $privateProfile = Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $owner->id,
            'visibility' => 'private',
        ]);
        $draftTrack = Track::factory()->create(['user_id' => $owner->id, 'status' => 'draft', 'visibility' => 'public']);
        $draftEvent = Event::factory()->create(['organizer_user_id' => $owner->id, 'status' => 'draft', 'visibility' => 'public']);
        $unpublishedMedia = MediaItem::factory()->create(['user_id' => $owner->id]);
        $token = $user->createToken('security')->plainTextToken;

        foreach ([
            ['profiles', $privateProfile->id],
            ['tracks', $draftTrack->id],
            ['events', $draftEvent->id],
            ['media_items', $unpublishedMedia->id],
        ] as [$type, $id]) {
            $this->withToken($token)->postJson('/api/saved', [
                'entity_type' => $type,
                'entity_id' => $id,
            ])->assertForbidden();
        }

        $this->withToken($token)->postJson('/api/reactions', [
            'entity_type' => 'media_items',
            'entity_id' => $unpublishedMedia->id,
            'type' => 'inspired',
        ])->assertForbidden();
    }

    public function test_saved_item_stops_serializing_an_entity_after_it_becomes_private(): void
    {
        $user = User::factory()->create();
        $profileUser = User::factory()->create();
        $profile = Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $profileUser->id,
            'visibility' => 'public',
            'status' => 'active',
        ]);
        $token = $user->createToken('saved')->plainTextToken;

        $this->withToken($token)->postJson('/api/saved', [
            'entity_type' => 'profiles',
            'entity_id' => $profile->id,
        ])->assertCreated();

        $profile->update(['visibility' => 'private']);

        $this->withToken($token)->getJson('/api/saved')
            ->assertOk()
            ->assertJsonCount(0, 'saved.data');
    }
}
