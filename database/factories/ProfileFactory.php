<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProfileFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->name();

        return [
            'uuid' => (string) Str::uuid(),
            'profileable_type' => User::class,
            'profileable_id' => User::factory(),
            'handle' => fake()->unique()->userName(),
            'display_name' => $name,
            'type' => 'user',
            'bio' => fake()->paragraph(),
            'tagline' => fake()->sentence(6),
            'visibility' => 'public',
            'status' => 'active',
        ];
    }
}
