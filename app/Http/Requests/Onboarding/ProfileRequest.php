<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'display_name' => ['required', 'string', 'max:160'],
            'username' => [
                'required',
                'string',
                'max:120',
                'alpha_dash:ascii',
                Rule::unique('users', 'username')->ignore($userId),
                Rule::unique('profiles', 'handle')->ignore($this->user()->profiles()->first()?->id),
            ],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'short_bio' => ['required', 'string', 'max:500'],
            'tagline' => ['nullable', 'string', 'max:180'],
            'website_url' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
