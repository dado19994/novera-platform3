<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class IdentitiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'creative_identity_ids' => ['required', 'array', 'min:1'],
            'creative_identity_ids.*' => ['integer', 'distinct', 'exists:creative_identities,id'],
            'primary_creative_identity_id' => ['nullable', 'integer', 'exists:creative_identities,id'],
            'availability_status' => ['nullable', 'string', 'max:40'],
        ];
    }
}
