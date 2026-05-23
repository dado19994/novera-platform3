<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Track\StoreTrackRequest;
use App\Http\Resources\TrackResource;
use App\Models\MediaItem;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TrackController extends Controller
{
    public function store(StoreTrackRequest $request): JsonResponse
    {
        $data = $request->validated();
        $audio = MediaItem::query()->where('user_id', $request->user()->id)->findOrFail($data['audio_media_id']);

        abort_unless($audio->type === 'audio', 422, 'The selected audio media must be an audio item.');

        if (isset($data['cover_media_id'])) {
            MediaItem::query()->where('user_id', $request->user()->id)->findOrFail($data['cover_media_id']);
        }

        $track = Track::query()->create([
            'user_id' => $request->user()->id,
            'city_id' => $data['city_id'] ?? null,
            'area_id' => $data['area_id'] ?? null,
            'audio_media_item_id' => $data['audio_media_id'],
            'artwork_media_item_id' => $data['cover_media_id'] ?? null,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(6)),
            'description' => $data['description'] ?? null,
            'type' => 'track',
            'status' => $data['status'] ?? 'published',
            'visibility' => $data['visibility'] ?? 'public',
            'source_type' => 'upload',
            'duration_seconds' => $data['duration'] ?? $audio->duration_seconds,
            'genre' => $data['genre'] ?? null,
            'published_at' => now(),
        ]);

        $track->moods()->sync(collect($data['mood_ids'] ?? [])->mapWithKeys(fn (int $id) => [
            $id => ['source' => 'user', 'created_at' => now(), 'updated_at' => now()],
        ])->all());

        return response()->json([
            'message' => 'Track created.',
            'track' => new TrackResource($track->fresh(['audio', 'artwork', 'moods'])),
        ], 201);
    }

    public function show(Track $track): JsonResponse
    {
        abort_unless(
            ($track->visibility === 'public' && $track->status === 'published') || $track->user_id === request()->user()?->id,
            404,
        );

        return response()->json([
            'track' => new TrackResource($track->load([
                'audio' => fn ($query) => $query->where('processing_status', 'ready'),
                'artwork' => fn ($query) => $query->where('processing_status', 'ready'),
                'moods',
            ])),
        ]);
    }
}
