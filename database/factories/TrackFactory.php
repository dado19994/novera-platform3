<?php

namespace Database\Factories;

use App\Models\MediaItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TrackFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'user_id' => User::factory(),
            'audio_media_item_id' => MediaItem::factory()->state(['type' => 'audio']),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
            'type' => 'track',
            'status' => 'published',
            'visibility' => 'public',
            'source_type' => 'upload',
            'duration_seconds' => fake()->numberBetween(60, 420),
            'published_at' => now(),
        ];
    }
}
