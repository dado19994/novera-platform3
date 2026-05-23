<?php

namespace App\Http\Requests\Track;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'audio_media_id' => ['required', 'integer', 'exists:media_items,id'],
            'cover_media_id' => ['nullable', 'integer', 'exists:media_items,id'],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'mood_ids' => ['nullable', 'array'],
            'mood_ids.*' => ['integer', 'distinct', 'exists:moods,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'genre' => ['nullable', 'string', 'max:120'],
            'visibility' => ['nullable', 'string', 'max:40'],
            'status' => ['nullable', 'string', 'max:40'],
        ];
    }
}
