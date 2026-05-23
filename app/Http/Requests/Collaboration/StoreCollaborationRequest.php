<?php

namespace App\Http\Requests\Collaboration;

use App\Models\Collaboration;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCollaborationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Collaboration::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:220'],
            'description' => ['required', 'string'],
            'type' => ['required', Rule::in($this->types())],
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'creator_id' => ['nullable', 'integer', 'exists:users,id'],
            'collective_id' => ['nullable', 'integer', 'exists:collectives,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'deadline' => ['nullable', 'date'],
            'status' => ['required', 'string', 'max:40'],
            'visibility' => ['nullable', 'string', 'max:40'],
            'remote_type' => ['nullable', 'string', 'max:40'],
            'needed_roles' => ['nullable', 'array'],
        ];
    }

    private function types(): array
    {
        return [
            'looking_for_dj',
            'looking_for_visual_artist',
            'looking_for_performer',
            'venue_opportunity',
            'collective_recruiting',
            'open_creative_call',
        ];
    }
}
