<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Country;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EventFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'uuid' => (string) Str::uuid(),
            'organizer_user_id' => User::factory(),
            'country_id' => Country::factory(),
            'city_id' => City::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'type' => 'exhibition',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addDays(10),
            'ends_at' => now()->addDays(10)->addHours(3),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ];
    }
}
