<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'type' => $this->type,
            'status' => $this->status,
            'subject' => $this->subject,
            'collaboration_id' => $this->collaboration_id,
            'event_id' => $this->event_id,
            'collective_id' => $this->collective_id,
            'last_message_at' => $this->last_message_at,
            'participants' => UserResource::collection($this->whenLoaded('participants')),
            'last_message' => new MessageResource($this->whenLoaded('lastMessage')),
            'collaboration' => new CollaborationResource($this->whenLoaded('collaboration')),
            'event' => new EventResource($this->whenLoaded('event')),
            'collective' => new CollectiveResource($this->whenLoaded('collective')),
        ];
    }
}
