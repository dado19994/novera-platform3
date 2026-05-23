<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    private bool $includePrivateFields = false;

    public function includePrivateFields(): self
    {
        $this->includePrivateFields = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->when(
                $this->includePrivateFields || $request->user()?->is($this->resource),
                $this->email,
            ),
            'status' => $this->status,
            'onboarding_status' => $this->onboarding_status,
            'onboarding_completed' => (bool) $this->onboarding_completed,
            'home_country_id' => $this->home_country_id,
            'home_city_id' => $this->home_city_id,
            'home_area_id' => $this->home_area_id,
            'profile' => new ProfileResource($this->whenLoaded('profiles', fn () => $this->profiles->first())),
            'creative_identities' => CreativeIdentityResource::collection($this->whenLoaded('creativeIdentities')),
        ];
    }
}
