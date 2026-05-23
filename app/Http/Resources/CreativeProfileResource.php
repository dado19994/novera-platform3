<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreativeProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->resource['user']),
            'profile' => new ProfileResource($this->resource['profile']),
            'creative_identities' => CreativeIdentityResource::collection($this->resource['creative_identities']),
            'moods' => MoodResource::collection($this->resource['moods']),
            'city' => new CityResource($this->resource['city']),
            'country' => new CountryResource($this->resource['country']),
            'featured_media' => MediaItemResource::collection($this->resource['featured_media']),
            'tracks' => TrackResource::collection($this->resource['tracks']),
            'upcoming_events' => EventResource::collection($this->resource['upcoming_events']),
            'collectives' => CollectiveResource::collection($this->resource['collectives']),
            'collaboration_status' => $this->resource['collaboration_status'],
        ];
    }
}
