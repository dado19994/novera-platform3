<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttachEventMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('attachMedia', $this->route('event')) ?? false;
    }

    public function rules(): array
    {
        return [
            'media_item_id' => [
                'required',
                'integer',
                Rule::exists('media_items', 'id')->where(fn ($query) => $query->where('user_id', $this->user()->id)->whereNull('deleted_at')),
            ],
            'type' => ['nullable', 'string', 'max:40'],
            'status' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
