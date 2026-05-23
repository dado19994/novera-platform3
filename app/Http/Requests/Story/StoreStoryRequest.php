<?php

namespace App\Http\Requests\Story;

use Illuminate\Foundation\Http\FormRequest;

class StoreStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'media_id' => ['required', 'integer', 'exists:media_items,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
            'artistic_moment_type' => ['required', 'string', 'max:80'],
            'text' => ['nullable', 'string', 'max:1000'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'visibility' => ['nullable', 'string', 'max:40'],
        ];
    }
}
