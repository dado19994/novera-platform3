<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->user_id,
            'sender' => new UserResource($this->whenLoaded('user')),
            'type' => $this->type,
            'status' => $this->status,
            'body' => $this->body,
            'media' => new MediaItemResource($this->whenLoaded('mediaItem')),
            'metadata' => $this->metadata,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
