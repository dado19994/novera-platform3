<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscoveryArtistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'score' => $this->resource['score'],
            'user' => new UserResource($this->resource['user']),
            'profile' => new ProfileResource($this->resource['profile']),
            'creative_identities' => CreativeIdentityResource::collection($this->resource['creative_identities']),
            'moods' => MoodResource::collection($this->resource['moods']),
            'city' => new CityResource($this->resource['city']),
        ];
    }
}
