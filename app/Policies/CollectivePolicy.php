<?php

namespace App\Policies;

use App\Models\Collective;
use App\Models\User;

class CollectivePolicy
{
    public function viewAny(?User $user = null): bool
    {
        return true;
    }

    public function view(?User $user, Collective $collective): bool
    {
        return ($collective->visibility === 'public' && $collective->status === 'active') || $this->manages($user, $collective);
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function update(User $user, Collective $collective): bool
    {
        return $this->manages($user, $collective);
    }

    public function join(User $user, Collective $collective): bool
    {
        return $user->status === 'active'
            && $collective->status === 'active'
            && $collective->visibility === 'public'
            && $collective->recruiting_status !== 'closed'
            && ! $collective->members()->where('users.id', $user->id)->wherePivotIn('status', ['active', 'invited'])->exists();
    }

    public function approveMember(User $user, Collective $collective): bool
    {
        return $this->manages($user, $collective);
    }

    private function manages(?User $user, Collective $collective): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->id === $collective->owner_user_id) {
            return true;
        }

        return $collective->members()
            ->where('users.id', $user->id)
            ->wherePivotIn('role', ['owner', 'admin'])
            ->wherePivot('status', 'active')
            ->exists();
    }
}
