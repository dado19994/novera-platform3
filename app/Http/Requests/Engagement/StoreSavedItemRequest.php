<?php

namespace App\Http\Requests\Engagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSavedItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'entity_type' => ['required', Rule::in(['posts', 'media_items', 'tracks', 'events', 'collaborations', 'profiles'])],
            'entity_id' => ['required', 'integer'],
            'type' => ['nullable', 'string', 'max:40'],
            'collection_name' => ['nullable', 'string', 'max:120'],
        ];
    }
}
