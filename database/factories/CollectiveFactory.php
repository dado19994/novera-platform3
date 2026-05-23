<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CollectiveFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'uuid' => (string) Str::uuid(),
            'owner_user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'type' => 'collective',
            'status' => 'active',
            'visibility' => 'public',
            'recruiting_status' => 'closed',
            'description' => fake()->paragraph(),
            'manifesto' => fake()->paragraph(),
        ];
    }
}
