<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavedItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'collection_name' => $this->collection_name,
            'entity_type' => $this->entityType(),
            'entity_id' => $this->saveable_id,
            'entity' => new EngagementEntityResource($this->whenLoaded('saveable')),
            'created_at' => $this->created_at,
        ];
    }

    private function entityType(): ?string
    {
        return array_search($this->saveable_type, EngagementEntityResource::map(), true) ?: null;
    }
}
