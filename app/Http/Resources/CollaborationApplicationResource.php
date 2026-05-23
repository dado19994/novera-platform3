<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollaborationApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'collaboration_id' => $this->collaboration_id,
            'applicant_id' => $this->user_id,
            'applicant' => new UserResource($this->whenLoaded('user')),
            'message' => $this->message,
            'status' => $this->status,
            'portfolio_url' => $this->portfolio_url,
            'submitted_at' => $this->submitted_at,
        ];
    }
}
