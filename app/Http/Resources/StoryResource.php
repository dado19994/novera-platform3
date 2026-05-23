<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'type' => $this->type,
            'artistic_moment_type' => $this->artistic_moment_type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'text' => $this->text,
            'expires_at' => $this->expires_at,
            'media' => new MediaItemResource($this->whenLoaded('mediaItem')),
            'user' => new UserResource($this->whenLoaded('user')),
            'event' => new EventResource($this->whenLoaded('event')),
            'collective' => new CollectiveResource($this->whenLoaded('collective')),
        ];
    }
}
