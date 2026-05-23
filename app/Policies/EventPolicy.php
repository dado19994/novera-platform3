<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewAny(?User $user = null): bool
    {
        return true;
    }

    public function view(?User $user, Event $event): bool
    {
        return ($event->visibility === 'public' && $event->status === 'published')
            || $user?->id === $event->organizer_user_id
            || $this->managesCollective($user, $event);
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function update(User $user, Event $event): bool
    {
        return $user->id === $event->organizer_user_id || $this->managesCollective($user, $event);
    }

    public function attend(User $user, Event $event): bool
    {
        return $user->status === 'active'
            && $event->status === 'published'
            && $event->visibility === 'public';
    }

    public function attachMedia(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    private function managesCollective(?User $user, Event $event): bool
    {
        if (! $user || ! $event->collective_id) {
            return false;
        }

        return $event->collective()
            ->whereHas('members', function ($query) use ($user): void {
                $query->where('users.id', $user->id)
                    ->whereIn('collective_members.role', ['owner', 'admin', 'editor'])
                    ->where('collective_members.status', 'active');
            })
            ->exists();
    }
}
