<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['image', 'video', 'audio', 'artwork'])],
            'file' => ['required', 'file', 'max:51200'],
            'alt_text' => ['nullable', 'string', 'max:500'],
            'duration_seconds' => ['nullable', 'numeric', 'min:0'],
            'disk' => ['nullable', 'string', 'max:80'],
        ];
    }
}
