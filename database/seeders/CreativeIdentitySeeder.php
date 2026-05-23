<?php

namespace Database\Seeders;

use App\Models\CreativeIdentity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CreativeIdentitySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['Artist', 'role'],
            ['Musician', 'role'],
            ['DJ', 'role'],
            ['Producer', 'role'],
            ['Photographer', 'role'],
            ['Designer', 'role'],
            ['Filmmaker', 'role'],
            ['Curator', 'role'],
            ['Organizer', 'role'],
            ['Venue Operator', 'role'],
            ['Writer', 'role'],
            ['Dancer', 'role'],
            ['Visual Art', 'discipline'],
            ['Music', 'discipline'],
            ['Photography', 'discipline'],
            ['Film', 'discipline'],
            ['Design', 'discipline'],
            ['Performance', 'discipline'],
            ['Open to Collaborations', 'intent'],
            ['Open to Bookings', 'intent'],
            ['Open to Commissions', 'intent'],
            ['Looking for Collective', 'intent'],
        ];

        foreach ($items as $index => [$name, $type]) {
            CreativeIdentity::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'type' => $type,
                    'description' => null,
                    'sort_order' => $index + 1,
                    'status' => 'active',
                ],
            );
        }
    }
}
