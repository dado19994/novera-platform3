<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Collective;
use App\Models\Country;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Mood;
use App\Models\Story;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Database\Seeders\MoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaTrackStoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_and_delete_media_with_storage_abstraction(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/media', [
            'type' => 'image',
            'disk' => 'public',
            'file' => UploadedFile::fake()->image('frame.jpg', 1200, 800),
            'alt_text' => 'A warm cinematic frame.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Media uploaded.')
            ->assertJsonPath('media.type', 'image')
            ->assertJsonPath('media.disk', 'public');

        $media = MediaItem::query()->firstOrFail();
        Storage::disk('public')->assertExists($media->path);

        $this->withToken($token)->deleteJson('/api/media/'.$media->id)
            ->assertOk()
            ->assertJsonPath('message', 'Media deleted.');

        Storage::disk('public')->assertMissing($media->path);
        $this->assertSoftDeleted('media_items', ['id' => $media->id]);
    }

    public function test_user_can_create_track_with_audio_cover_and_moods(): void
    {
        $this->seed([GeographySeeder::class, MoodSeeder::class]);

        $user = User::factory()->create();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $audio = MediaItem::factory()->create(['user_id' => $user->id, 'type' => 'audio', 'duration_seconds' => 123.456]);
        $cover = MediaItem::factory()->create(['user_id' => $user->id, 'type' => 'artwork']);
        $moodIds = Mood::query()->limit(2)->pluck('id')->all();

        $response = $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/tracks', [
                'title' => 'Soft Signal',
                'description' => 'A nocturnal sketch.',
                'audio_media_id' => $audio->id,
                'cover_media_id' => $cover->id,
                'duration' => 120.5,
                'mood_ids' => $moodIds,
                'city_id' => $city->id,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Track created.')
            ->assertJsonPath('track.title', 'Soft Signal')
            ->assertJsonPath('track.audio.id', $audio->id)
            ->assertJsonPath('track.artwork.id', $cover->id)
            ->assertJsonCount(2, 'track.moods');

        $trackId = $response->json('track.id');

        $this->getJson('/api/tracks/'.$trackId)
            ->assertOk()
            ->assertJsonPath('track.title', 'Soft Signal')
            ->assertJsonCount(2, 'track.moods');
    }

    public function test_user_can_create_artistic_story_and_feed_only_returns_active_unexpired_stories(): void
    {
        $this->seed(GeographySeeder::class);

        $country = Country::query()->where('iso2', 'IT')->firstOrFail();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $user = User::factory()->create(['home_country_id' => $country->id, 'home_city_id' => $city->id]);
        $media = MediaItem::factory()->create(['user_id' => $user->id, 'type' => 'video']);
        $collective = Collective::factory()->create([
            'owner_user_id' => $user->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
        ]);
        $event = Event::query()->create([
            'organizer_user_id' => $user->id,
            'collective_id' => $collective->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'Story Night',
            'type' => 'screening',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addDay(),
            'timezone' => 'Europe/Rome',
        ]);

        $this->withToken($user->createToken('test')->plainTextToken)
            ->postJson('/api/stories', [
                'media_id' => $media->id,
                'event_id' => $event->id,
                'collective_id' => $collective->id,
                'artistic_moment_type' => 'backstage_process',
                'text' => 'Light tests before doors.',
            ])->assertCreated()
            ->assertJsonPath('message', 'Story created.')
            ->assertJsonPath('story.artistic_moment_type', 'backstage_process')
            ->assertJsonPath('story.event.id', $event->id)
            ->assertJsonPath('story.collective.id', $collective->id);

        Story::query()->create([
            'user_id' => $user->id,
            'media_item_id' => $media->id,
            'type' => 'video',
            'status' => 'active',
            'visibility' => 'public',
            'artistic_moment_type' => 'expired_moment',
            'expires_at' => now()->subMinute(),
        ]);

        $this->getJson('/api/stories/feed?city_id='.$city->id)
            ->assertOk()
            ->assertJsonCount(1, 'stories.data')
            ->assertJsonPath('stories.data.0.artistic_moment_type', 'backstage_process');
    }

    public function test_draft_track_marked_public_is_not_readable_anonymously(): void
    {
        $owner = User::factory()->create();
        $track = \App\Models\Track::factory()->create([
            'user_id' => $owner->id,
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $this->getJson('/api/tracks/'.$track->id)->assertNotFound();
    }
}
