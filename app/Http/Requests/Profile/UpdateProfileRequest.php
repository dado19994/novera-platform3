<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $profile = $this->user()->profiles()->where('type', 'user')->first();

        return [
            'display_name' => ['required', 'string', 'max:160'],
            'username' => [
                'required',
                'string',
                'max:120',
                'alpha_dash:ascii',
                Rule::unique('users', 'username')->ignore($this->user()->id),
                Rule::unique('profiles', 'handle')->ignore($profile?->id),
            ],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'short_bio' => ['required', 'string', 'max:500'],
            'tagline' => ['nullable', 'string', 'max:180'],
            'website_url' => ['nullable', 'url', 'max:2048'],
            'visibility' => ['nullable', 'string', 'max:40'],
        ];
    }
}
