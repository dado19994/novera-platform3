<?php

namespace App\Http\Requests\Engagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReactionRequest extends FormRequest
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
            'type' => ['required', Rule::in(['rare', 'inspired', 'want_to_collaborate', 'future_classic', 'save_vibe', 'want_to_see_live'])],
        ];
    }
}
