<?php

namespace App\Policies;

use App\Models\Collaboration;
use App\Models\User;

class CollaborationPolicy
{
    public function viewAny(?User $user = null): bool
    {
        return true;
    }

    public function view(?User $user, Collaboration $collaboration): bool
    {
        return ($collaboration->visibility === 'public' && $collaboration->status === 'open')
            || $user?->id === $collaboration->user_id
            || $this->managesCollective($user, $collaboration);
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function update(User $user, Collaboration $collaboration): bool
    {
        return $user->id === $collaboration->user_id || $this->managesCollective($user, $collaboration);
    }

    public function apply(User $user, Collaboration $collaboration): bool
    {
        return $user->status === 'active'
            && $user->id !== $collaboration->user_id
            && $collaboration->status === 'open'
            && $collaboration->visibility === 'public';
    }

    public function viewApplications(User $user, Collaboration $collaboration): bool
    {
        return $this->update($user, $collaboration);
    }

    public function updateApplication(User $user, Collaboration $collaboration): bool
    {
        if ($user->id === $collaboration->user_id) {
            return true;
        }

        $collective = $collaboration->collective;

        if (! $collective) {
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

    private function managesCollective(?User $user, Collaboration $collaboration): bool
    {
        if (! $user || ! $collaboration->collective_id) {
            return false;
        }

        return $collaboration->collective()
            ->whereHas('members', function ($query) use ($user): void {
                $query->where('users.id', $user->id)
                    ->whereIn('collective_members.role', ['owner', 'admin', 'editor'])
                    ->where('collective_members.status', 'active');
            })
            ->exists();
    }
}
