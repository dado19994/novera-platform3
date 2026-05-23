<?php

namespace App\Policies;

use App\Models\Track;
use App\Models\User;

class TrackPolicy
{
    public function view(?User $user, Track $track): bool
    {
        return ($track->visibility === 'public' && $track->status === 'published')
            || $user?->id === $track->user_id;
    }
}
