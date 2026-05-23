<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectiveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'manifesto' => $this->manifesto,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'recruiting_status' => $this->recruiting_status,
            'country_id' => $this->country_id,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'cover_media_id' => $this->cover_media_id,
            'country' => new CountryResource($this->whenLoaded('country')),
            'city' => new CityResource($this->whenLoaded('city')),
            'cover_media' => new MediaItemResource($this->whenLoaded('coverMedia')),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'profile' => new ProfileResource($this->whenLoaded('profile')),
            'members_count' => $this->whenCounted('members'),
            'membership' => $this->whenPivotLoaded('collective_members', fn () => [
                'role' => $this->pivot->role,
                'status' => $this->pivot->status,
            ]),
        ];
    }
}
