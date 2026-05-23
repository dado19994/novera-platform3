<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Event::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:220'],
            'slug' => ['nullable', 'string', 'max:260', 'alpha_dash:ascii', 'unique:events,slug'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'max:60'],
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'venue_id' => ['nullable', 'integer', 'exists:venues,id'],
            'collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'timezone' => ['nullable', 'string', 'max:80'],
            'visibility' => ['required', 'string', 'max:40'],
            'status' => ['required', 'string', 'max:40'],
            'ticket_url' => ['nullable', 'url', 'max:2048'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'mood_ids' => ['nullable', 'array'],
            'mood_ids.*' => ['integer', 'distinct', 'exists:moods,id'],
            'lineup_artist_ids' => ['nullable', 'array'],
            'lineup_artist_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'lineup' => ['nullable', 'array'],
            'lineup.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
            'lineup.*.collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
            'lineup.*.profile_id' => ['nullable', 'integer', 'exists:profiles,id'],
            'lineup.*.name_override' => ['nullable', 'string', 'max:180'],
            'lineup.*.role' => ['nullable', 'string', 'max:80'],
            'lineup.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'lineup.*.status' => ['nullable', 'string', 'max:40'],
        ];
    }
}
