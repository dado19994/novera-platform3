<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreConversationRequest;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Conversation::class);

        $conversations = Conversation::query()
            ->with($this->relations())
            ->whereHas('participants', fn ($query) => $query->where('users.id', $request->user()->id)->where('conversation_participants.status', 'active'))
            ->latest('last_message_at')
            ->latest()
            ->paginate(20);

        return response()->json([
            'conversations' => [
                'data' => ConversationResource::collection($conversations->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'per_page' => $conversations->perPage(),
                    'total' => $conversations->total(),
                ],
            ],
        ]);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $conversation = DB::transaction(function () use ($request): Conversation {
            $data = $request->validated();
            $participantIds = collect($data['participant_ids'])
                ->push($request->user()->id)
                ->unique()
                ->values();

            abort_if($data['type'] === 'direct' && $participantIds->count() !== 2, 422, 'Direct conversations require exactly two participants.');

            $conversation = Conversation::query()->create([
                'type' => $data['type'],
                'status' => 'active',
                'subject' => $data['subject'] ?? null,
                'collaboration_id' => $data['collaboration_id'] ?? null,
                'event_id' => $data['event_id'] ?? null,
                'collective_id' => $data['collective_id'] ?? null,
            ]);

            $conversation->participants()->attach($participantIds->mapWithKeys(fn (int $id) => [
                $id => [
                    'role' => $id === $request->user()->id ? 'owner' : 'member',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ])->all());

            return $conversation;
        });

        return response()->json([
            'message' => 'Conversation created.',
            'conversation' => new ConversationResource($conversation->fresh($this->relations())),
        ], 201);
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with(['user.profiles', 'mediaItem'])
            ->oldest()
            ->paginate(50);

        $lastMessage = $messages->getCollection()->last();

        if ($lastMessage) {
            $conversation->participants()->updateExistingPivot($request->user()->id, [
                'last_read_message_id' => $lastMessage->id,
                'last_read_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'messages' => [
                'data' => MessageResource::collection($messages->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                ],
            ],
        ]);
    }

    public function storeMessage(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $data = $request->validated();

        $message = DB::transaction(function () use ($request, $conversation, $data) {
            $message = $conversation->messages()->create([
                'user_id' => $request->user()->id,
                'media_item_id' => $data['media_item_id'] ?? null,
                'type' => $data['type'],
                'status' => 'sent',
                'body' => $data['body'] ?? null,
                'metadata' => [
                    ...($data['metadata'] ?? []),
                    'collaboration_id' => $data['collaboration_id'] ?? null,
                    'event_id' => $data['event_id'] ?? null,
                    'collective_id' => $data['collective_id'] ?? null,
                ],
            ]);

            $conversation->forceFill([
                'last_message_id' => $message->id,
                'last_message_at' => now(),
            ])->save();

            $conversation->participants()->updateExistingPivot($request->user()->id, [
                'last_read_message_id' => $message->id,
                'last_read_at' => now(),
                'updated_at' => now(),
            ]);

            return $message;
        });

        return response()->json([
            'message' => 'Message sent.',
            'data' => new MessageResource($message->load(['user.profiles', 'mediaItem'])),
        ], 201);
    }

    private function relations(): array
    {
        return [
            'participants.profiles',
            'lastMessage.user.profiles',
            'collaboration',
            'event',
            'collective',
        ];
    }
}
