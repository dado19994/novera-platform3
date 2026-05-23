<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'handle' => $this->handle,
            'display_name' => $this->display_name,
            'type' => $this->type,
            'short_bio' => $this->bio,
            'tagline' => $this->tagline,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'country_id' => $this->country_id,
            'city' => new CityResource($this->whenLoaded('city')),
            'country' => new CountryResource($this->whenLoaded('country')),
            'moods' => MoodResource::collection($this->whenLoaded('moods')),
            'avatar' => new MediaItemResource($this->whenLoaded('avatar')),
            'cover' => new MediaItemResource($this->whenLoaded('cover')),
            'visibility' => $this->visibility,
            'status' => $this->status,
        ];
    }
}
