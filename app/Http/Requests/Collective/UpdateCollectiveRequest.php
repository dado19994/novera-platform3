<?php

namespace App\Http\Requests\Collective;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCollectiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('collective')) ?? false;
    }

    public function rules(): array
    {
        $collective = $this->route('collective');

        return [
            'name' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:220', 'alpha_dash:ascii', Rule::unique('collectives', 'slug')->ignore($collective?->id)],
            'manifesto' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'cover_media_id' => [
                'nullable',
                'integer',
                Rule::exists('media_items', 'id')->where(fn ($query) => $query->where('user_id', $this->user()->id)->whereNull('deleted_at')),
            ],
            'recruiting_status' => ['required', 'string', 'max:40'],
            'type' => ['nullable', 'string', 'max:60'],
            'status' => ['nullable', 'string', 'max:40'],
            'visibility' => ['nullable', 'string', 'max:40'],
        ];
    }
}
