<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventLineupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'status' => $this->status,
            'sort_order' => $this->sort_order,
            'name_override' => $this->name_override,
            'user' => new UserResource($this->whenLoaded('user')),
            'profile' => new ProfileResource($this->whenLoaded('profile')),
            'collective' => new CollectiveResource($this->whenLoaded('collective')),
        ];
    }
}
