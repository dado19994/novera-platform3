<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Moodable extends Model
{
    protected $guarded = [];

    public function mood(): BelongsTo
    {
        return $this->belongsTo(Mood::class);
    }

    public function moodable(): MorphTo
    {
        return $this->morphTo();
    }
}
