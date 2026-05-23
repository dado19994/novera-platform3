<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Mood extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'moodable');
    }

    public function tracks(): MorphToMany
    {
        return $this->morphedByMany(Track::class, 'moodable');
    }

    public function events(): MorphToMany
    {
        return $this->morphedByMany(Event::class, 'moodable');
    }
}
