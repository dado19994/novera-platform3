<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Collective;
use App\Models\Country;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Mood;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Database\Seeders\MoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_event_with_lineup_and_moods(): void
    {
        [$organizer, $artist, $country, $city] = $this->seedEventContext();
        $token = $organizer->createToken('test')->plainTextToken;
        $moodIds = Mood::query()->limit(2)->pluck('id')->all();

        $response = $this->withToken($token)->postJson('/api/events', [
            'title' => 'Novera Night',
            'slug' => 'novera-night',
            'description' => 'A warm cinematic gathering.',
            'type' => 'concert',
            'country_id' => $country->id,
            'city_id' => $city->id,
            'starts_at' => now()->addWeek()->toISOString(),
            'ends_at' => now()->addWeek()->addHours(3)->toISOString(),
            'visibility' => 'public',
            'status' => 'published',
            'lineup_artist_ids' => [$artist->id],
            'mood_ids' => $moodIds,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Event created.')
            ->assertJsonPath('event.title', 'Novera Night')
            ->assertJsonCount(1, 'event.lineup_artists')
            ->assertJsonCount(2, 'event.mood_tags');

        $this->assertDatabaseHas('events', [
            'slug' => 'novera-night',
            'organizer_user_id' => $organizer->id,
            'status' => 'published',
        ]);
    }

    public function test_public_event_index_and_show_include_social_ecosystem_context(): void
    {
        [$organizer, $artist, $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $event->lineups()->create([
            'user_id' => $artist->id,
            'role' => 'artist',
            'status' => 'confirmed',
        ]);
        $event->moods()->sync([Mood::query()->firstOrFail()->id => ['source' => 'user']]);
        $event->attendees()->attach($artist->id, ['status' => 'going', 'source' => 'organic']);

        $this->getJson('/api/events?city_id='.$city->id)
            ->assertOk()
            ->assertJsonPath('events.data.0.title', 'City Light Session')
            ->assertJsonCount(1, 'events.data.0.lineup_artists')
            ->assertJsonCount(1, 'events.data.0.attendees');

        $this->getJson('/api/events/'.$event->id)
            ->assertOk()
            ->assertJsonPath('event.title', 'City Light Session')
            ->assertJsonCount(1, 'event.lineup_artists')
            ->assertJsonCount(1, 'event.mood_tags')
            ->assertJsonCount(1, 'event.attendees');
    }

    public function test_organizer_can_update_event_and_attach_media(): void
    {
        [$organizer, , $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $media = MediaItem::factory()->create([
            'user_id' => $organizer->id,
            'type' => 'image',
            'processing_status' => 'ready',
        ]);
        $token = $organizer->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson('/api/events/'.$event->id, [
            'title' => 'Updated Session',
            'slug' => 'updated-session',
            'description' => 'Updated description.',
            'type' => 'screening',
            'country_id' => $country->id,
            'city_id' => $city->id,
            'starts_at' => now()->addWeeks(2)->toISOString(),
            'visibility' => 'public',
            'status' => 'published',
            'lineup' => [
                ['name_override' => 'Guest Artist', 'role' => 'performer'],
            ],
        ])->assertOk()
            ->assertJsonPath('message', 'Event updated.')
            ->assertJsonPath('event.title', 'Updated Session')
            ->assertJsonCount(1, 'event.lineup_artists');

        $this->withToken($token)->postJson('/api/events/'.$event->id.'/media', [
            'media_item_id' => $media->id,
            'type' => 'flyer',
            'sort_order' => 1,
        ])->assertCreated()
            ->assertJsonPath('message', 'Event media attached.')
            ->assertJsonCount(1, 'event.media_preview');
    }

    public function test_user_can_attend_unattend_and_list_event_attendees(): void
    {
        [$organizer, $artist, $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $token = $artist->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/events/'.$event->id.'/attend')
            ->assertOk()
            ->assertJsonPath('message', 'Attendance saved.')
            ->assertJsonCount(1, 'event.attendees');

        $this->getJson('/api/events/'.$event->id.'/attendees')
            ->assertOk()
            ->assertJsonPath('attendees.data.0.username', $artist->username);

        $this->withToken($token)->deleteJson('/api/events/'.$event->id.'/attend')
            ->assertOk()
            ->assertJsonPath('message', 'Attendance removed.');

        $this->assertDatabaseMissing('event_attendees', [
            'event_id' => $event->id,
            'user_id' => $artist->id,
        ]);
    }

    public function test_non_organizer_cannot_update_event(): void
    {
        [$organizer, $artist, $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $token = $artist->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson('/api/events/'.$event->id, [
            'title' => 'Not Allowed',
            'type' => 'screening',
            'country_id' => $country->id,
            'city_id' => $city->id,
            'starts_at' => now()->addWeek()->toISOString(),
            'visibility' => 'public',
            'status' => 'published',
        ])->assertForbidden();
    }

    public function test_draft_public_event_is_not_readable_by_the_public(): void
    {
        [$organizer, , $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $event->update(['status' => 'draft', 'published_at' => null]);

        $this->getJson('/api/events?status=draft')
            ->assertOk()
            ->assertJsonCount(0, 'events.data');

        $this->getJson('/api/events/'.$event->id)->assertForbidden();
    }

    public function test_organizer_cannot_attach_another_users_media_to_an_event(): void
    {
        [$organizer, $other, $country, $city] = $this->seedEventContext();
        $event = $this->createPublishedEvent($organizer, $country, $city);
        $foreignMedia = MediaItem::factory()->create(['user_id' => $other->id]);

        $this->withToken($organizer->createToken('owner')->plainTextToken)
            ->postJson('/api/events/'.$event->id.'/media', [
                'media_item_id' => $foreignMedia->id,
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('media_item_id');

        $this->assertDatabaseMissing('event_media', ['media_item_id' => $foreignMedia->id]);
    }

    private function seedEventContext(): array
    {
        $this->seed([
            GeographySeeder::class,
            MoodSeeder::class,
        ]);

        $country = Country::query()->where('iso2', 'IT')->firstOrFail();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $organizer = User::factory()->create(['username' => 'organizer']);
        $artist = User::factory()->create(['username' => 'artist']);

        Collective::factory()->create([
            'owner_user_id' => $organizer->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
        ]);

        return [$organizer, $artist, $country, $city];
    }

    private function createPublishedEvent(User $organizer, Country $country, City $city): Event
    {
        return Event::query()->create([
            'organizer_user_id' => $organizer->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'City Light Session',
            'slug' => 'city-light-session',
            'description' => 'A live event.',
            'type' => 'screening',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addWeek(),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ]);
    }
}
