<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Story\StoreStoryRequest;
use App\Http\Resources\StoryResource;
use App\Models\MediaItem;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function store(StoreStoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $media = MediaItem::query()->where('user_id', $request->user()->id)->findOrFail($data['media_id']);

        $story = Story::query()->create([
            'user_id' => $request->user()->id,
            'collective_id' => $data['collective_id'] ?? null,
            'event_id' => $data['event_id'] ?? null,
            'city_id' => $data['city_id'] ?? $request->user()->home_city_id,
            'area_id' => $data['area_id'] ?? $request->user()->home_area_id,
            'media_item_id' => $media->id,
            'type' => $media->type,
            'status' => 'active',
            'visibility' => $data['visibility'] ?? 'public',
            'artistic_moment_type' => $data['artistic_moment_type'],
            'text' => $data['text'] ?? null,
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'message' => 'Story created.',
            'story' => new StoryResource($story->load(['mediaItem', 'user.profiles', 'event', 'collective'])),
        ], 201);
    }

    public function feed(Request $request): JsonResponse
    {
        $stories = Story::query()
            ->with([
                'mediaItem' => fn ($query) => $query->where('processing_status', 'ready'),
                'user.profiles' => fn ($query) => $query->publiclyVisible(),
                'event' => fn ($query) => $query->publiclyVisible(),
                'collective' => fn ($query) => $query->publiclyVisible(),
            ])
            ->where('status', 'active')
            ->where('visibility', 'public')
            ->where('expires_at', '>', now())
            ->when($request->query('city_id'), fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'stories' => [
                'data' => StoryResource::collection($stories->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $stories->currentPage(),
                    'last_page' => $stories->lastPage(),
                    'per_page' => $stories->perPage(),
                    'total' => $stories->total(),
                ],
            ],
        ]);
    }
}
