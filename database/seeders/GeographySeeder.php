<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;

class GeographySeeder extends Seeder
{
    public function run(): void
    {
        $italy = Country::query()->updateOrCreate(
            ['iso2' => 'IT'],
            ['iso3' => 'ITA', 'name' => 'Italy', 'slug' => 'italy', 'status' => 'active'],
        );

        $usa = Country::query()->updateOrCreate(
            ['iso2' => 'US'],
            ['iso3' => 'USA', 'name' => 'United States', 'slug' => 'united-states', 'status' => 'active'],
        );

        $spain = Country::query()->updateOrCreate(
            ['iso2' => 'ES'],
            ['iso3' => 'ESP', 'name' => 'Spain', 'slug' => 'spain', 'status' => 'active'],
        );

        $germany = Country::query()->updateOrCreate(
            ['iso2' => 'DE'],
            ['iso3' => 'DEU', 'name' => 'Germany', 'slug' => 'germany', 'status' => 'active'],
        );

        $denmark = Country::query()->updateOrCreate(
            ['iso2' => 'DK'],
            ['iso3' => 'DNK', 'name' => 'Denmark', 'slug' => 'denmark', 'status' => 'active'],
        );

        $rome = City::query()->updateOrCreate(
            ['country_id' => $italy->id, 'slug' => 'rome'],
            [
                'name' => 'Rome',
                'timezone' => 'Europe/Rome',
                'latitude' => 41.9028000,
                'longitude' => 12.4964000,
                'status' => 'active',
            ],
        );

        $milan = City::query()->updateOrCreate(
            ['country_id' => $italy->id, 'slug' => 'milan'],
            [
                'name' => 'Milan',
                'timezone' => 'Europe/Rome',
                'latitude' => 45.4642000,
                'longitude' => 9.1900000,
                'status' => 'active',
            ],
        );

        $newYork = City::query()->updateOrCreate(
            ['country_id' => $usa->id, 'slug' => 'new-york'],
            [
                'name' => 'New York',
                'timezone' => 'America/New_York',
                'latitude' => 40.7128000,
                'longitude' => -74.0060000,
                'status' => 'active',
            ],
        );

        City::query()->updateOrCreate(
            ['slug' => 'barcelona'],
            [
                'country_id' => $spain->id,
                'name' => 'Barcelona',
                'timezone' => 'Europe/Madrid',
                'latitude' => 41.3874000,
                'longitude' => 2.1686000,
                'status' => 'active',
            ],
        );

        City::query()->updateOrCreate(
            ['slug' => 'berlin'],
            [
                'country_id' => $germany->id,
                'name' => 'Berlin',
                'timezone' => 'Europe/Berlin',
                'latitude' => 52.5200000,
                'longitude' => 13.4050000,
                'status' => 'active',
            ],
        );

        City::query()->updateOrCreate(
            ['slug' => 'copenhagen'],
            [
                'country_id' => $denmark->id,
                'name' => 'Copenhagen',
                'timezone' => 'Europe/Copenhagen',
                'latitude' => 55.6761000,
                'longitude' => 12.5683000,
                'status' => 'active',
            ],
        );

        City::query()->updateOrCreate(
            ['slug' => 'bari'],
            [
                'country_id' => $italy->id,
                'name' => 'Bari',
                'timezone' => 'Europe/Rome',
                'latitude' => 41.1171000,
                'longitude' => 16.8719000,
                'status' => 'active',
            ],
        );

        $areas = [
            [$rome, 'Pigneto', 'pigneto', 41.8891000, 12.5299000],
            [$rome, 'San Lorenzo', 'san-lorenzo', 41.8986000, 12.5156000],
            [$milan, 'Navigli', 'navigli', 45.4515000, 9.1746000],
            [$milan, 'Isola', 'isola', 45.4873000, 9.1919000],
            [$newYork, 'Brooklyn', 'brooklyn', 40.6782000, -73.9442000],
            [$newYork, 'Lower East Side', 'lower-east-side', 40.7150000, -73.9843000],
        ];

        foreach ($areas as [$city, $name, $slug, $latitude, $longitude]) {
            Area::query()->updateOrCreate(
                ['city_id' => $city->id, 'slug' => $slug],
                [
                    'name' => $name,
                    'type' => 'neighborhood',
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'status' => 'active',
                ],
            );
        }
    }
}
