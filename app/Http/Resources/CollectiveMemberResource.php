<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectiveMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'profile' => new ProfileResource($this->whenLoaded('profiles', fn () => $this->profiles->first())),
            'membership' => $this->whenPivotLoaded('collective_members', fn () => [
                'role' => $this->pivot->role,
                'status' => $this->pivot->status,
                'joined_at' => $this->pivot->joined_at,
            ]),
        ];
    }
}
