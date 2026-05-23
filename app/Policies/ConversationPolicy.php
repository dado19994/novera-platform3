<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->status === 'active';
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $this->participates($user, $conversation);
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->participates($user, $conversation);
    }

    private function participates(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()
            ->where('users.id', $user->id)
            ->wherePivot('status', 'active')
            ->exists();
    }
}
