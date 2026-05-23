<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Engagement\StoreReactionRequest;
use App\Http\Requests\Engagement\StoreSavedItemRequest;
use App\Http\Resources\EngagementEntityResource;
use App\Http\Resources\ReactionResource;
use App\Http\Resources\SavedItemResource;
use App\Models\Reaction;
use App\Models\SavedItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EngagementController extends Controller
{
    public function storeReaction(StoreReactionRequest $request): JsonResponse
    {
        $entity = $this->resolveEntity($request, $request->validated('entity_type'), $request->validated('entity_id'));

        $reaction = Reaction::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'reactionable_type' => $entity::class,
                'reactionable_id' => $entity->id,
                'type' => $request->validated('type'),
            ],
            ['status' => 'active'],
        );

        return response()->json([
            'message' => 'Reaction saved.',
            'engagement' => [
                'has_reacted' => true,
                'reaction' => new ReactionResource($reaction),
            ],
        ], 201);
    }

    public function destroyReaction(Reaction $reaction): JsonResponse
    {
        abort_unless($reaction->user_id === request()->user()->id, 403);

        $reaction->delete();

        return response()->json([
            'message' => 'Reaction removed.',
            'engagement' => [
                'has_reacted' => false,
            ],
        ]);
    }

    public function saved(Request $request): JsonResponse
    {
        $savedItems = SavedItem::query()
            ->with('saveable')
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->latest()
            ->paginate(20);

        $savedItems->setCollection(
            $savedItems->getCollection()
                ->filter(fn (SavedItem $item) => $item->saveable && Gate::forUser($request->user())->allows('view', $item->saveable))
                ->values(),
        );

        return response()->json([
            'saved' => [
                'data' => SavedItemResource::collection($savedItems->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $savedItems->currentPage(),
                    'last_page' => $savedItems->lastPage(),
                    'per_page' => $savedItems->perPage(),
                    'total' => $savedItems->total(),
                ],
            ],
        ]);
    }

    public function storeSaved(StoreSavedItemRequest $request): JsonResponse
    {
        $entity = $this->resolveEntity($request, $request->validated('entity_type'), $request->validated('entity_id'));

        $savedItem = SavedItem::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'saveable_type' => $entity::class,
                'saveable_id' => $entity->id,
                'type' => $request->validated('type') ?? 'save',
            ],
            [
                'status' => 'active',
                'collection_name' => $request->validated('collection_name'),
            ],
        );

        return response()->json([
            'message' => 'Item saved.',
            'engagement' => [
                'is_saved' => true,
                'saved_item' => new SavedItemResource($savedItem->load('saveable')),
            ],
        ], 201);
    }

    public function destroySaved(SavedItem $savedItem): JsonResponse
    {
        abort_unless($savedItem->user_id === request()->user()->id, 403);

        $savedItem->delete();

        return response()->json([
            'message' => 'Saved item removed.',
            'engagement' => [
                'is_saved' => false,
            ],
        ]);
    }

    private function resolveEntity(Request $request, string $entityType, int $entityId): Model
    {
        $class = EngagementEntityResource::map()[$entityType] ?? null;

        abort_unless($class, 422, 'Unsupported entity type.');

        $entity = $class::query()->findOrFail($entityId);

        $this->authorizeForUser($request->user(), 'view', $entity);

        return $entity;
    }
}
