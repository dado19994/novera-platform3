<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\FirstMediaRequest;
use App\Http\Requests\Onboarding\IdentitiesRequest;
use App\Http\Requests\Onboarding\MoodsRequest;
use App\Http\Requests\Onboarding\ProfileRequest;
use App\Http\Resources\CreativeIdentityResource;
use App\Http\Resources\MediaItemResource;
use App\Http\Resources\MoodResource;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\UserResource;
use App\Models\City;
use App\Models\MediaItem;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class OnboardingController extends Controller
{
    public function profile(ProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $city = City::query()->findOrFail($data['city_id']);

        $user->forceFill([
            'name' => $data['display_name'],
            'username' => $data['username'],
            'home_country_id' => $city->country_id,
            'home_city_id' => $city->id,
            'home_area_id' => $data['area_id'] ?? null,
            'onboarding_status' => 'in_progress',
        ])->save();

        $profile = $user->profiles()->updateOrCreate(
            ['type' => 'user'],
            [
                'handle' => $data['username'],
                'display_name' => $data['display_name'],
                'bio' => $data['short_bio'],
                'tagline' => $data['tagline'] ?? null,
                'country_id' => $city->country_id,
                'city_id' => $city->id,
                'area_id' => $data['area_id'] ?? null,
                'website_url' => $data['website_url'] ?? null,
                'visibility' => 'public',
                'status' => 'active',
            ],
        );

        return response()->json([
            'message' => 'Onboarding profile saved.',
            'profile' => new ProfileResource($profile),
            'user' => new UserResource($user->load(['profiles', 'creativeIdentities'])),
        ]);
    }

    public function identities(IdentitiesRequest $request): JsonResponse
    {
        $user = $request->user();
        $ids = $request->validated('creative_identity_ids');
        $primaryId = $request->validated('primary_creative_identity_id') ?? $ids[0];
        $availability = $request->validated('availability_status');

        if (! in_array($primaryId, $ids, true)) {
            return response()->json([
                'message' => 'The primary creative identity must be included in creative_identity_ids.',
                'errors' => [
                    'primary_creative_identity_id' => ['The selected primary identity is not in the selected identities.'],
                ],
            ], 422);
        }

        $sync = collect($ids)->mapWithKeys(fn (int $id) => [
            $id => [
                'is_primary' => $id === $primaryId,
                'availability_status' => $availability,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ])->all();

        $user->creativeIdentities()->sync($sync);
        $user->forceFill(['onboarding_status' => 'in_progress'])->save();

        return response()->json([
            'message' => 'Creative identities saved.',
            'creative_identities' => CreativeIdentityResource::collection($user->creativeIdentities()->get()),
        ]);
    }

    public function moods(MoodsRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profiles()->where('type', 'user')->firstOrFail();

        $profile->moods()->sync(
            collect($request->validated('mood_ids'))->mapWithKeys(fn (int $id) => [
                $id => [
                    'source' => 'user',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ])->all(),
        );

        $user->forceFill(['onboarding_status' => 'in_progress'])->save();

        return response()->json([
            'message' => 'Moods saved.',
            'moods' => MoodResource::collection($profile->moods()->get()),
        ]);
    }

    public function firstMedia(FirstMediaRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $media = MediaItem::query()->create([
            'user_id' => $user->id,
            'type' => $data['type'],
            'disk' => $data['disk'] ?? 'public',
            'path' => $data['path'],
            'mime_type' => $data['mime_type'],
            'size_bytes' => $data['size_bytes'] ?? 0,
            'width' => $data['width'] ?? null,
            'height' => $data['height'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
            'alt_text' => $data['alt_text'] ?? null,
            'processing_status' => 'ready',
        ]);

        $post = Post::query()->create([
            'user_id' => $user->id,
            'profile_id' => $user->profiles()->where('type', 'user')->value('id'),
            'city_id' => $user->home_city_id,
            'area_id' => $user->home_area_id,
            'type' => 'media',
            'status' => 'published',
            'visibility' => 'public',
            'caption' => $data['caption'] ?? null,
            'primary_media_item_id' => $media->id,
            'metadata' => ['source' => 'onboarding'],
            'published_at' => now(),
        ]);

        $media->forceFill([
            'mediable_type' => Post::class,
            'mediable_id' => $post->id,
        ])->save();

        $user->forceFill(['onboarding_status' => 'in_progress'])->save();

        return response()->json([
            'message' => 'First media saved.',
            'media' => new MediaItemResource($media),
            'post_id' => $post->id,
        ], 201);
    }

    public function complete(Request $request): JsonResponse
    {
        $user = $request->user();

        $missing = [];

        if (! $user->profiles()->where('type', 'user')->exists()) {
            $missing[] = 'profile';
        }

        if (! $user->creativeIdentities()->exists()) {
            $missing[] = 'creative_identities';
        }

        $profile = $user->profiles()->where('type', 'user')->first();
        if (! $profile || ! $profile->moods()->exists()) {
            $missing[] = 'moods';
        }

        if ($missing !== []) {
            return response()->json([
                'message' => 'Onboarding is incomplete.',
                'missing' => Arr::sort($missing),
            ], 422);
        }

        $user->forceFill([
            'onboarding_completed' => true,
            'onboarding_status' => 'completed',
        ])->save();

        return response()->json([
            'message' => 'Onboarding completed.',
            'user' => new UserResource($user->load(['profiles', 'creativeIdentities'])),
        ]);
    }
}
