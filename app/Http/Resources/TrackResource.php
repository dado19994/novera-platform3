<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'genre' => $this->genre,
            'duration' => $this->duration_seconds,
            'city_id' => $this->city_id,
            'area_id' => $this->area_id,
            'published_at' => $this->published_at,
            'audio' => new MediaItemResource($this->whenLoaded('audio')),
            'artwork' => new MediaItemResource($this->whenLoaded('artwork')),
            'moods' => MoodResource::collection($this->whenLoaded('moods')),
        ];
    }
}
