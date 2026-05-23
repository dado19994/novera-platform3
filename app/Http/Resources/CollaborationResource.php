<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollaborationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'creator_id' => $this->user_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'country_id' => $this->country_id,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'collective_id' => $this->collective_id,
            'event_id' => $this->event_id,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'remote_type' => $this->remote_type,
            'needed_roles' => $this->needed_roles,
            'deadline' => $this->deadline_at,
            'creator' => new UserResource($this->whenLoaded('user')),
            'country' => new CountryResource($this->whenLoaded('country')),
            'city' => new CityResource($this->whenLoaded('city')),
            'collective' => new CollectiveResource($this->whenLoaded('collective')),
            'event' => new EventResource($this->whenLoaded('event')),
            'applications_count' => $this->whenCounted('applications'),
        ];
    }
}
