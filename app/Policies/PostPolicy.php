<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function view(?User $user, Post $post): bool
    {
        return ($post->visibility === 'public' && $post->status === 'published')
            || $user?->id === $post->user_id;
    }
}
