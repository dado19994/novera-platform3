<?php

namespace Database\Factories;

use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Country> */
class CountryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->country();

        return [
            'iso2' => fake()->unique()->countryCode(),
            'iso3' => strtoupper(fake()->unique()->lexify('???')),
            'name' => $name,
            'slug' => Str::slug($name),
            'status' => 'active',
        ];
    }
}
