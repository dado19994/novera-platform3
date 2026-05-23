<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('sendMessage', $this->route('conversation')) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['text', 'collaboration_invite', 'event_invite', 'collective_invite', 'booking_request_placeholder'])],
            'body' => ['nullable', 'string', 'max:5000'],
            'media_item_id' => [
                'nullable',
                'integer',
                Rule::exists('media_items', 'id')->where(fn ($query) => $query->where('user_id', $this->user()->id)->whereNull('deleted_at')),
            ],
            'collaboration_id' => ['nullable', 'integer', 'exists:collaborations,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
