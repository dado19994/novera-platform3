<?php

namespace App\Http\Requests\Collaboration;

use Illuminate\Foundation\Http\FormRequest;

class ApplyToCollaborationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('apply', $this->route('collaboration')) ?? false;
    }

    public function rules(): array
    {
        return [
            'applicant_id' => ['nullable', 'integer', 'exists:users,id'],
            'message' => ['required', 'string', 'max:4000'],
            'portfolio_url' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
