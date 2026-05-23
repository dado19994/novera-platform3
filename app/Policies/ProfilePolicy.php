<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\User;

class ProfilePolicy
{
    public function view(?User $user, Profile $profile): bool
    {
        return ($profile->visibility === 'public' && $profile->status === 'active')
            || ($user && $profile->profileable_type === User::class && $profile->profileable_id === $user->id);
    }
}
