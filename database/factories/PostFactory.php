<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'type' => 'media',
            'status' => 'published',
            'visibility' => 'public',
            'caption' => fake()->paragraph(),
            'published_at' => now(),
        ];
    }
}
