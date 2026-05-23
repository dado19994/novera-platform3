<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventAttendeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'attendance' => $this->whenPivotLoaded('event_attendees', fn () => [
                'status' => $this->pivot->status,
                'source' => $this->pivot->source,
                'checked_in_at' => $this->pivot->checked_in_at,
            ]),
        ];
    }
}
