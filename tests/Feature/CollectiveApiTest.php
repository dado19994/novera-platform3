<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Collaboration;
use App\Models\Collective;
use App\Models\Country;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectiveApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_collective(): void
    {
        [$owner, , $country, $city] = $this->context();

        $this->withToken($owner->createToken('test')->plainTextToken)
            ->postJson('/api/collectives', [
                'name' => 'Warm Frame',
                'slug' => 'warm-frame',
                'manifesto' => 'Build cultural infrastructure with care.',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'recruiting_status' => 'open',
            ])->assertCreated()
            ->assertJsonPath('message', 'Collective created.')
            ->assertJsonPath('collective.name', 'Warm Frame')
            ->assertJsonPath('collective.slug', 'warm-frame')
            ->assertJsonPath('collective.recruiting_status', 'open')
            ->assertJsonPath('collective.members_count', 1);

        $this->assertDatabaseHas('collective_members', [
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
        ]);
    }

    public function test_public_collective_index_and_show_by_slug(): void
    {
        [$owner, , $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);

        $this->getJson('/api/collectives?city_id='.$city->id)
            ->assertOk()
            ->assertJsonPath('collectives.data.0.slug', 'warm-frame')
            ->assertJsonPath('collectives.data.0.city.slug', 'rome');

        $this->getJson('/api/collectives/'.$collective->slug)
            ->assertOk()
            ->assertJsonPath('collective.name', 'Warm Frame')
            ->assertJsonPath('collective.manifesto', 'Build cultural infrastructure with care.');
    }

    public function test_member_cannot_update_collective(): void
    {
        [$owner, $member, $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);
        $collective->members()->attach($member->id, ['role' => 'member', 'status' => 'active']);

        $this->withToken($member->createToken('member')->plainTextToken)
            ->putJson('/api/collectives/'.$collective->slug, [
                'name' => 'Nope',
                'slug' => 'nope',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'recruiting_status' => 'open',
            ])->assertForbidden();
    }

    public function test_owner_can_update_collective(): void
    {
        [$owner, , $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);

        $this->withToken($owner->createToken('owner')->plainTextToken)
            ->putJson('/api/collectives/'.$collective->slug, [
                'name' => 'Warm Frame Updated',
                'slug' => 'warm-frame-updated',
                'manifesto' => 'Updated manifesto.',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'recruiting_status' => 'selective',
            ])->assertOk()
            ->assertJsonPath('message', 'Collective updated.')
            ->assertJsonPath('collective.slug', 'warm-frame-updated')
            ->assertJsonPath('collective.recruiting_status', 'selective');
    }

    public function test_user_can_request_to_join_collective(): void
    {
        [$owner, $member, $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);

        $this->withToken($member->createToken('member')->plainTextToken)
            ->postJson('/api/collectives/'.$collective->slug.'/join-request')
            ->assertCreated()
            ->assertJsonPath('message', 'Join request submitted.');

        $this->assertDatabaseHas('collective_members', [
            'collective_id' => $collective->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'invited',
        ]);
    }

    public function test_owner_can_approve_join_request(): void
    {
        [$owner, $member, $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);
        $collective->members()->attach($member->id, [
            'role' => 'member',
            'status' => 'invited',
        ]);

        $this->withToken($owner->createToken('owner')->plainTextToken)
            ->postJson('/api/collectives/'.$collective->slug.'/members/'.$member->id.'/approve')
            ->assertOk()
            ->assertJsonPath('message', 'Member approved.');

        $this->assertDatabaseHas('collective_members', [
            'collective_id' => $collective->id,
            'user_id' => $member->id,
            'status' => 'active',
        ]);
    }

    public function test_collective_members_events_and_collaborations_endpoints(): void
    {
        [$owner, $member, $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);
        $collective->members()->attach($member->id, ['role' => 'member', 'status' => 'active', 'joined_at' => now()]);

        Event::query()->create([
            'organizer_user_id' => $owner->id,
            'collective_id' => $collective->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'Collective Night',
            'slug' => 'collective-night',
            'type' => 'concert',
            'status' => 'published',
            'visibility' => 'public',
            'starts_at' => now()->addWeek(),
            'timezone' => 'Europe/Rome',
            'published_at' => now(),
        ]);

        Collaboration::query()->create([
            'user_id' => $owner->id,
            'collective_id' => $collective->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'Collective recruiting',
            'description' => 'Looking for new members.',
            'type' => 'collective_recruiting',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
        ]);

        $this->getJson('/api/collectives/'.$collective->slug.'/members')
            ->assertOk()
            ->assertJsonCount(2, 'members.data');

        $this->getJson('/api/collectives/'.$collective->slug.'/events')
            ->assertOk()
            ->assertJsonPath('events.data.0.title', 'Collective Night');

        $this->getJson('/api/collectives/'.$collective->slug.'/collaborations')
            ->assertOk()
            ->assertJsonPath('collaborations.data.0.type', 'collective_recruiting');
    }

    public function test_inactive_public_collective_is_not_publicly_readable(): void
    {
        [$owner, , $country, $city] = $this->context();
        $collective = $this->createCollective($owner, $country, $city);
        $collective->update(['status' => 'draft', 'visibility' => 'public']);

        $this->getJson('/api/collectives?status=draft')
            ->assertOk()
            ->assertJsonCount(0, 'collectives.data');

        $this->getJson('/api/collectives/'.$collective->slug)->assertForbidden();
    }

    public function test_collective_owner_cannot_use_another_users_media_as_cover(): void
    {
        [$owner, $member, $country, $city] = $this->context();
        $foreignMedia = MediaItem::factory()->create(['user_id' => $member->id]);

        $this->withToken($owner->createToken('owner')->plainTextToken)
            ->postJson('/api/collectives', [
                'name' => 'No Borrowed Cover',
                'slug' => 'no-borrowed-cover',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'cover_media_id' => $foreignMedia->id,
                'recruiting_status' => 'open',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('cover_media_id');
    }

    private function context(): array
    {
        $this->seed(GeographySeeder::class);

        $country = Country::query()->where('iso2', 'IT')->firstOrFail();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $owner = User::factory()->create(['username' => 'owner']);
        $member = User::factory()->create(['username' => 'member']);

        return [$owner, $member, $country, $city];
    }

    private function createCollective(User $owner, Country $country, City $city): Collective
    {
        $collective = Collective::factory()->create([
            'owner_user_id' => $owner->id,
            'name' => 'Warm Frame',
            'slug' => 'warm-frame',
            'manifesto' => 'Build cultural infrastructure with care.',
            'country_id' => $country->id,
            'city_id' => $city->id,
            'recruiting_status' => 'open',
        ]);

        $collective->members()->attach($owner->id, [
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return $collective;
    }
}
