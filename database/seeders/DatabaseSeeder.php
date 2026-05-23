<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            GeographySeeder::class,
            CreativeIdentitySeeder::class,
            MoodSeeder::class,
        ]);

        $italy = Country::query()->where('iso2', 'IT')->first();
        $rome = City::query()->where('slug', 'rome')->first();

        $user = User::factory()->create([
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => 'test@example.com',
            'home_country_id' => $italy?->id,
            'home_city_id' => $rome?->id,
            'onboarding_status' => 'completed',
        ]);

        Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $user->id,
            'handle' => 'test-user',
            'display_name' => 'Test User',
            'country_id' => $italy?->id,
            'city_id' => $rome?->id,
        ]);
    }
}
