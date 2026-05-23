<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'type' => $this->type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'caption' => $this->caption,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'published_at' => $this->published_at,
            'primary_media' => new MediaItemResource($this->whenLoaded('primaryMedia')),
        ];
    }
}
