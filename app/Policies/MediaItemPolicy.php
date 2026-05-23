<?php

namespace App\Policies;

use App\Models\Collective;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;

class MediaItemPolicy
{
    public function view(?User $user, MediaItem $media): bool
    {
        if ($user?->id === $media->user_id) {
            return true;
        }

        if ($media->processing_status !== 'ready') {
            return false;
        }

        return Post::query()->publiclyVisible()->where('primary_media_item_id', $media->id)->exists()
            || Track::query()->publiclyVisible()
                ->where(fn ($query) => $query->where('audio_media_item_id', $media->id)->orWhere('artwork_media_item_id', $media->id))
                ->exists()
            || Event::query()->publiclyVisible()
                ->where(fn ($query) => $query->where('cover_media_item_id', $media->id)->orWhereHas('media', fn ($mediaQuery) => $mediaQuery->where('media_items.id', $media->id)->wherePivot('status', 'active')))
                ->exists()
            || Profile::query()->publiclyVisible()
                ->where(fn ($query) => $query->where('avatar_media_item_id', $media->id)->orWhere('cover_media_item_id', $media->id))
                ->exists()
            || Collective::query()->publiclyVisible()->where('cover_media_id', $media->id)->exists();
    }
}
