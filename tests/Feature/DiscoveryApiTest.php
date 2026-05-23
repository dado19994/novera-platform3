<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Collaboration;
use App\Models\Collective;
use App\Models\Country;
use App\Models\CreativeIdentity;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Mood;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;
use Database\Seeders\CreativeIdentitySeeder;
use Database\Seeders\GeographySeeder;
use Database\Seeders\MoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscoveryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_discovery_home_returns_modular_sections_ranked_by_city_and_mood(): void
    {
        [$rome, $milan, $warmMood] = $this->seedDiscoveryGraph();

        $this->getJson('/api/discovery/home?city_id='.$rome->id.'&mood='.$warmMood->slug)
            ->assertOk()
            ->assertJsonPath('featured_events.0.title', 'Rome Warm Night')
            ->assertJsonPath('emerging_artists.0.profile.handle', 'rome-artist')
            ->assertJsonPath('open_collaborations.0.title', 'Rome visual call')
            ->assertJsonPath('collectives_near_you.0.slug', 'rome-collective')
            ->assertJsonPath('tracks_to_discover.0.title', 'Rome Tone');

        $this->getJson('/api/discovery/home?city_id='.$milan->id)
            ->assertOk()
            ->assertJsonPath('featured_events.0.title', 'Milan Signal');
    }

    public function test_city_discovery_by_slug_uses_route_city_as_filter(): void
    {
        [$rome] = $this->seedDiscoveryGraph();

        $this->getJson('/api/discovery/city/'.$rome->slug)
            ->assertOk()
            ->assertJsonPath('featured_events.0.city.id', $rome->id)
            ->assertJsonPath('collectives_near_you.0.city.id', $rome->id);
    }

    public function test_city_discovery_keeps_numeric_id_url_compatibility(): void
    {
        [$rome] = $this->seedDiscoveryGraph();

        $this->getJson('/api/discovery/city/'.$rome->id)
            ->assertOk()
            ->assertJsonPath('featured_events.0.city.id', $rome->id);
    }

    public function test_city_discovery_returns_not_found_for_unknown_slug(): void
    {
        $this->seed(GeographySeeder::class);

        $this->getJson('/api/discovery/city/unknown-scene')->assertNotFound();
    }

    public function test_geography_seeds_city_selector_slugs(): void
    {
        $this->seed(GeographySeeder::class);

        foreach (['rome', 'barcelona', 'berlin', 'copenhagen', 'bari'] as $slug) {
            $this->assertDatabaseHas('cities', ['slug' => $slug]);
        }
    }

    public function test_discovery_filters_artists_events_collaborations_and_collectives(): void
    {
        [$rome, , $warmMood, $artistIdentity] = $this->seedDiscoveryGraph();

        $this->getJson('/api/discovery/artists?city_id='.$rome->id.'&creative_identity='.$artistIdentity->slug)
            ->assertOk()
            ->assertJsonPath('artists.0.profile.handle', 'rome-artist');

        $this->getJson('/api/discovery/events?city_id='.$rome->id.'&event_type=screening&mood='.$warmMood->slug)
            ->assertOk()
            ->assertJsonPath('events.0.title', 'Rome Warm Night');

        $this->getJson('/api/discovery/collaborations?city_id='.$rome->id.'&collaboration_type=looking_for_visual_artist')
            ->assertOk()
            ->assertJsonPath('collaborations.0.title', 'Rome visual call');

        $this->getJson('/api/discovery/collectives?city_id='.$rome->id.'&country_id='.$rome->country_id)
            ->assertOk()
            ->assertJsonPath('collectives.0.slug', 'rome-collective');
    }

    private function seedDiscoveryGraph(): array
    {
        $this->seed([
            GeographySeeder::class,
            MoodSeeder::class,
            CreativeIdentitySeeder::class,
        ]);

        $italy = Country::query()->where('iso2', 'IT')->firstOrFail();
        $rome = City::query()->where('slug', 'rome')->firstOrFail();
        $milan = City::query()->where('slug', 'milan')->firstOrFail();
        $warmMood = Mood::query()->where('slug', 'warm')->firstOrFail();
        $artistIdentity = CreativeIdentity::query()->where('slug', 'artist')->firstOrFail();

        $romeArtist = User::factory()->create(['username' => 'rome_artist', 'home_country_id' => $italy->id, 'home_city_id' => $rome->id]);
        $romeArtist->creativeIdentities()->attach($artistIdentity->id, ['is_primary' => true]);
        $romeProfile = Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $romeArtist->id,
            'handle' => 'rome-artist',
            'city_id' => $rome->id,
            'country_id' => $italy->id,
        ]);
        $romeProfile->moods()->attach($warmMood->id, ['source' => 'user']);

        $milanArtist = User::factory()->create(['username' => 'milan_artist', 'home_country_id' => $italy->id, 'home_city_id' => $milan->id]);
        Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $milanArtist->id,
            'handle' => 'milan-artist',
            'city_id' => $milan->id,
            'country_id' => $italy->id,
        ]);

        $romeEvent = Event::query()->create([
            'organizer_user_id' => $romeArtist->id,
            'country_id' => $italy->id,
            'city_id' => $rome->id,
            'title' => 'Rome Warm Night',
            'type' => 'screening',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addDays(3),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ]);
        $romeEvent->moods()->attach($warmMood->id, ['source' => 'user']);

        Event::query()->create([
            'organizer_user_id' => $milanArtist->id,
            'country_id' => $italy->id,
            'city_id' => $milan->id,
            'title' => 'Milan Signal',
            'type' => 'concert',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addDays(2),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ]);

        $collaboration = Collaboration::query()->create([
            'user_id' => $romeArtist->id,
            'country_id' => $italy->id,
            'city_id' => $rome->id,
            'title' => 'Rome visual call',
            'description' => 'Looking for visuals.',
            'type' => 'looking_for_visual_artist',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
        ]);
        $collaboration->moods()->attach($warmMood->id, ['source' => 'user']);

        Collective::factory()->create([
            'owner_user_id' => $romeArtist->id,
            'name' => 'Rome Collective',
            'slug' => 'rome-collective',
            'country_id' => $italy->id,
            'city_id' => $rome->id,
            'recruiting_status' => 'open',
        ]);

        $audio = MediaItem::factory()->create(['user_id' => $romeArtist->id, 'type' => 'audio']);
        $track = Track::query()->create([
            'user_id' => $romeArtist->id,
            'city_id' => $rome->id,
            'audio_media_item_id' => $audio->id,
            'title' => 'Rome Tone',
            'type' => 'track',
            'status' => 'published',
            'visibility' => 'public',
            'source_type' => 'upload',
            'published_at' => now(),
        ]);
        $track->moods()->attach($warmMood->id, ['source' => 'user']);

        return [$rome, $milan, $warmMood, $artistIdentity];
    }
}
