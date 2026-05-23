<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'entity_type' => $this->entityType(),
            'entity_id' => $this->reactionable_id,
            'created_at' => $this->created_at,
        ];
    }

    private function entityType(): ?string
    {
        return array_search($this->reactionable_type, EngagementEntityResource::map(), true) ?: null;
    }
}
