<?php

namespace App\Http\Resources;

use App\Models\Collaboration;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EngagementEntityResource extends JsonResource
{
    public static function map(): array
    {
        return [
            'posts' => Post::class,
            'media_items' => MediaItem::class,
            'tracks' => Track::class,
            'events' => Event::class,
            'collaborations' => Collaboration::class,
            'profiles' => Profile::class,
        ];
    }

    public function toArray(Request $request): array
    {
        return match (true) {
            $this->resource instanceof Post => (new PostResource($this->resource->loadMissing('primaryMedia')))->resolve($request),
            $this->resource instanceof MediaItem => (new MediaItemResource($this->resource))->resolve($request),
            $this->resource instanceof Track => (new TrackResource($this->resource->loadMissing(['audio', 'artwork', 'moods'])))->resolve($request),
            $this->resource instanceof Event => (new EventResource($this->resource->loadMissing(['city', 'coverMedia', 'moods'])))->resolve($request),
            $this->resource instanceof Collaboration => (new CollaborationResource($this->resource->loadMissing(['user.profiles', 'city'])))->resolve($request),
            $this->resource instanceof Profile => (new ProfileResource($this->resource->loadMissing(['city', 'country', 'moods'])))->resolve($request),
            default => [],
        };
    }
}
