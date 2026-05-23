<?php

namespace App\Http\Requests\Message;

use App\Models\Conversation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Conversation::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['direct', 'group'])],
            'subject' => ['nullable', 'string', 'max:180'],
            'participant_ids' => ['required', 'array', 'min:1'],
            'participant_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'collaboration_id' => ['nullable', 'integer', 'exists:collaborations,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
        ];
    }
}
