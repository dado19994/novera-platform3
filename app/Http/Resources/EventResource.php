<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'country_id' => $this->country_id,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'venue_id' => $this->venue_id,
            'collective_id' => $this->collective_id,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'timezone' => $this->timezone,
            'ticket_url' => $this->ticket_url,
            'capacity' => $this->capacity,
            'published_at' => $this->published_at,
            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'country' => new CountryResource($this->whenLoaded('country')),
            'city' => new CityResource($this->whenLoaded('city')),
            'venue' => $this->whenLoaded('venue'),
            'collective' => new CollectiveResource($this->whenLoaded('collective')),
            'cover_media' => new MediaItemResource($this->whenLoaded('coverMedia')),
            'lineup_artists' => EventLineupResource::collection($this->whenLoaded('lineups')),
            'mood_tags' => MoodResource::collection($this->whenLoaded('moods')),
            'attendees' => EventAttendeeResource::collection($this->whenLoaded('attendees')),
            'media_preview' => MediaItemResource::collection($this->whenLoaded('media')),
        ];
    }
}
