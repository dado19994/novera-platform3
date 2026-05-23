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
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;
use Database\Seeders\CreativeIdentitySeeder;
use Database\Seeders\GeographySeeder;
use Database\Seeders\MoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_profile_response_includes_creative_identity_context(): void
    {
        [$user] = $this->createProfileGraph();

        $this->getJson('/api/profiles/'.$user->username)
            ->assertOk()
            ->assertJsonPath('profile.user.username', $user->username)
            ->assertJsonMissingPath('profile.user.email')
            ->assertJsonPath('profile.profile.display_name', 'Ada Novera')
            ->assertJsonPath('profile.city.slug', 'rome')
            ->assertJsonPath('profile.country.iso2', 'IT')
            ->assertJsonCount(2, 'profile.creative_identities')
            ->assertJsonCount(2, 'profile.moods')
            ->assertJsonCount(1, 'profile.featured_media')
            ->assertJsonCount(1, 'profile.tracks')
            ->assertJsonCount(1, 'profile.upcoming_events')
            ->assertJsonCount(1, 'profile.collectives')
            ->assertJsonPath('profile.collaboration_status.is_open', true)
            ->assertJsonPath('profile.collaboration_status.open_count', 1);
    }

    public function test_authenticated_user_can_fetch_and_update_own_profile(): void
    {
        [$user, $city] = $this->createProfileGraph();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/profile/me')
            ->assertOk()
            ->assertJsonPath('profile.user.email', $user->email)
            ->assertJsonPath('profile.profile.handle', 'ada_novera');

        $this->withToken($token)->putJson('/api/profile', [
            'display_name' => 'Ada Updated',
            'username' => 'ada_updated',
            'city_id' => $city->id,
            'short_bio' => 'Updated cinematic profile.',
            'tagline' => 'Culture systems.',
        ])->assertOk()
            ->assertJsonPath('message', 'Profile updated.')
            ->assertJsonPath('profile.handle', 'ada_updated')
            ->assertJsonPath('profile.display_name', 'Ada Updated')
            ->assertJsonPath('profile.short_bio', 'Updated cinematic profile.');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'ada_updated',
            'name' => 'Ada Updated',
        ]);
    }

    public function test_profile_section_endpoints_return_paginated_resources(): void
    {
        [$user] = $this->createProfileGraph();

        $this->getJson('/api/profiles/'.$user->username.'/media')
            ->assertOk()
            ->assertJsonPath('media.data.0.caption', 'First visual note.');

        $this->getJson('/api/profiles/'.$user->username.'/tracks')
            ->assertOk()
            ->assertJsonPath('tracks.data.0.title', 'Nocturne One');

        $this->getJson('/api/profiles/'.$user->username.'/events')
            ->assertOk()
            ->assertJsonPath('events.data.0.title', 'City Light Session');

        $this->getJson('/api/profiles/'.$user->username.'/collaborations')
            ->assertOk()
            ->assertJsonPath('collaborations.data.0.title', 'Looking for a visual collaborator');
    }

    public function test_private_profile_is_not_readable_through_public_profile_endpoints(): void
    {
        [$user] = $this->createProfileGraph();
        Profile::query()->where('profileable_id', $user->id)->update(['visibility' => 'private']);

        foreach (['', '/media', '/tracks', '/events', '/collaborations'] as $suffix) {
            $this->getJson('/api/profiles/'.$user->username.$suffix)->assertNotFound();
        }

        $this->withToken($user->createToken('owner')->plainTextToken)
            ->getJson('/api/profile/me')
            ->assertOk()
            ->assertJsonPath('profile.profile.visibility', 'private');
    }

    public function test_public_profile_only_exposes_ready_media_from_published_public_posts(): void
    {
        [$user, $city] = $this->createProfileGraph();

        $unpublished = MediaItem::factory()->create(['user_id' => $user->id, 'processing_status' => 'ready']);
        $draftMedia = MediaItem::factory()->create(['user_id' => $user->id, 'processing_status' => 'ready']);
        $privateMedia = MediaItem::factory()->create(['user_id' => $user->id, 'processing_status' => 'ready']);
        $pendingMedia = MediaItem::factory()->create(['user_id' => $user->id, 'processing_status' => 'pending']);

        foreach ([
            [$draftMedia, 'draft', 'public'],
            [$privateMedia, 'published', 'private'],
            [$pendingMedia, 'published', 'public'],
        ] as [$media, $status, $visibility]) {
            Post::query()->create([
                'user_id' => $user->id,
                'city_id' => $city->id,
                'type' => 'media',
                'status' => $status,
                'visibility' => $visibility,
                'primary_media_item_id' => $media->id,
                'published_at' => now(),
            ]);
        }

        $this->getJson('/api/profiles/'.$user->username)
            ->assertOk()
            ->assertJsonCount(1, 'profile.featured_media')
            ->assertJsonMissing(['path' => $unpublished->path])
            ->assertJsonMissing(['path' => $draftMedia->path])
            ->assertJsonMissing(['path' => $privateMedia->path])
            ->assertJsonMissing(['path' => $pendingMedia->path]);

        $this->getJson('/api/profiles/'.$user->username.'/media')
            ->assertOk()
            ->assertJsonCount(1, 'media.data');
    }

    private function createProfileGraph(): array
    {
        $this->seed([
            GeographySeeder::class,
            CreativeIdentitySeeder::class,
            MoodSeeder::class,
        ]);

        $country = Country::query()->where('iso2', 'IT')->firstOrFail();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $user = User::factory()->create([
            'name' => 'Ada Novera',
            'username' => 'ada_novera',
            'home_country_id' => $country->id,
            'home_city_id' => $city->id,
            'onboarding_completed' => true,
            'onboarding_status' => 'completed',
        ]);

        $profile = Profile::factory()->create([
            'profileable_type' => User::class,
            'profileable_id' => $user->id,
            'handle' => 'ada_novera',
            'display_name' => 'Ada Novera',
            'bio' => 'A cinematic maker exploring local scenes.',
            'country_id' => $country->id,
            'city_id' => $city->id,
        ]);

        $identityIds = CreativeIdentity::query()->limit(2)->pluck('id')->all();
        $user->creativeIdentities()->sync([
            $identityIds[0] => ['is_primary' => true, 'availability_status' => 'open'],
            $identityIds[1] => ['is_primary' => false, 'availability_status' => 'open'],
        ]);

        $moodIds = Mood::query()->limit(2)->pluck('id')->all();
        $profile->moods()->sync([
            $moodIds[0] => ['source' => 'user'],
            $moodIds[1] => ['source' => 'user'],
        ]);

        $media = MediaItem::factory()->create([
            'user_id' => $user->id,
            'type' => 'image',
            'processing_status' => 'ready',
        ]);

        Post::query()->create([
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'city_id' => $city->id,
            'type' => 'media',
            'status' => 'published',
            'visibility' => 'public',
            'caption' => 'First visual note.',
            'primary_media_item_id' => $media->id,
            'published_at' => now(),
        ]);

        Track::query()->create([
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'city_id' => $city->id,
            'title' => 'Nocturne One',
            'type' => 'track',
            'status' => 'published',
            'visibility' => 'public',
            'source_type' => 'external',
            'external_url' => 'https://example.com/nocturne-one',
            'published_at' => now(),
        ]);

        Event::query()->create([
            'organizer_user_id' => $user->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'City Light Session',
            'slug' => 'city-light-session',
            'type' => 'screening',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addWeek(),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ]);

        Collaboration::query()->create([
            'user_id' => $user->id,
            'city_id' => $city->id,
            'title' => 'Looking for a visual collaborator',
            'description' => 'Seeking a projection artist for a live set.',
            'type' => 'project',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
        ]);

        $collective = Collective::factory()->create([
            'owner_user_id' => $user->id,
            'name' => 'Warm Frame',
            'slug' => 'warm-frame',
            'city_id' => $city->id,
            'country_id' => $country->id,
        ]);
        $collective->members()->attach($user->id, [
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return [$user, $city];
    }
}
