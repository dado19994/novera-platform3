<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class MoodsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mood_ids' => ['required', 'array', 'min:1'],
            'mood_ids.*' => ['integer', 'distinct', 'exists:moods,id'],
        ];
    }
}
