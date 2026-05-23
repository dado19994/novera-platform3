<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CreativeIdentityFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->jobTitle();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'type' => 'role',
            'description' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(1, 100),
            'status' => 'active',
        ];
    }
}
