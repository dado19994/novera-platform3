<?php

namespace Database\Seeders;

use App\Models\Mood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MoodSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['Warm', 'mood'],
            ['Cinematic', 'aesthetic'],
            ['Raw', 'aesthetic'],
            ['Intimate', 'mood'],
            ['Experimental', 'scene'],
            ['Nocturnal', 'mood'],
            ['Ambient', 'energy'],
            ['High Energy', 'energy'],
            ['Minimal', 'aesthetic'],
            ['Underground', 'scene'],
            ['Communal', 'mood'],
            ['Dreamlike', 'mood'],
        ];

        foreach ($items as $index => [$name, $type]) {
            Mood::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'type' => $type,
                    'status' => 'active',
                    'sort_order' => $index + 1,
                ],
            );
        }
    }
}
