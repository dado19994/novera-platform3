<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Collaboration;
use App\Models\Collective;
use App\Models\Country;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollaborationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_collaboration(): void
    {
        [$creator, , $country, $city] = $this->context();
        $token = $creator->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/collaborations', [
            'title' => 'Looking for a visual artist',
            'description' => 'Seeking live visuals for a listening session.',
            'type' => 'looking_for_visual_artist',
            'country_id' => $country->id,
            'city_id' => $city->id,
            'creator_id' => $creator->id,
            'deadline' => now()->addMonth()->toISOString(),
            'status' => 'open',
        ])->assertCreated()
            ->assertJsonPath('message', 'Collaboration created.')
            ->assertJsonPath('collaboration.creator_id', $creator->id)
            ->assertJsonPath('collaboration.type', 'looking_for_visual_artist')
            ->assertJsonPath('collaboration.status', 'open');

        $this->assertDatabaseHas('collaborations', [
            'user_id' => $creator->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'type' => 'looking_for_visual_artist',
        ]);
    }

    public function test_public_collaboration_index_and_show(): void
    {
        [$creator, , $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->getJson('/api/collaborations?city_id='.$city->id)
            ->assertOk()
            ->assertJsonPath('collaborations.data.0.title', 'Open creative call')
            ->assertJsonPath('collaborations.data.0.creator_id', $creator->id)
            ->assertJsonPath('collaborations.data.0.country.iso2', 'IT');

        $this->getJson('/api/collaborations/'.$collaboration->id)
            ->assertOk()
            ->assertJsonPath('collaboration.title', 'Open creative call')
            ->assertJsonPath('collaboration.city.slug', 'rome');
    }

    public function test_non_creator_cannot_update_collaboration(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->withToken($applicant->createToken('test')->plainTextToken)
            ->putJson('/api/collaborations/'.$collaboration->id, [
                'title' => 'Not yours',
                'description' => 'Nope.',
                'type' => 'open_creative_call',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'status' => 'open',
            ])->assertForbidden();
    }

    public function test_creator_can_update_collaboration(): void
    {
        [$creator, , $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->withToken($creator->createToken('test')->plainTextToken)
            ->putJson('/api/collaborations/'.$collaboration->id, [
                'title' => 'Updated creative call',
                'description' => 'Updated details.',
                'type' => 'looking_for_performer',
                'country_id' => $country->id,
                'city_id' => $city->id,
                'status' => 'paused',
            ])->assertOk()
            ->assertJsonPath('message', 'Collaboration updated.')
            ->assertJsonPath('collaboration.title', 'Updated creative call')
            ->assertJsonPath('collaboration.type', 'looking_for_performer')
            ->assertJsonPath('collaboration.status', 'paused');
    }

    public function test_user_can_apply_to_collaboration(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->withToken($applicant->createToken('test')->plainTextToken)
            ->postJson('/api/collaborations/'.$collaboration->id.'/apply', [
                'applicant_id' => $applicant->id,
                'message' => 'I can bring projection mapping and stage visuals.',
                'status' => 'accepted',
            ])->assertCreated()
            ->assertJsonPath('message', 'Application submitted.')
            ->assertJsonPath('application.applicant_id', $applicant->id)
            ->assertJsonPath('application.status', 'pending');
    }

    public function test_non_creator_cannot_list_applications(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->withToken($applicant->createToken('test-two')->plainTextToken)
            ->getJson('/api/collaborations/'.$collaboration->id.'/applications')
            ->assertForbidden();
    }

    public function test_creator_can_list_applications(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);
        $collaboration->applications()->create([
            'user_id' => $applicant->id,
            'message' => 'I can bring projection mapping and stage visuals.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->withToken($creator->createToken('test')->plainTextToken)
            ->getJson('/api/collaborations/'.$collaboration->id.'/applications')
            ->assertOk()
            ->assertJsonPath('applications.data.0.applicant_id', $applicant->id)
            ->assertJsonPath('applications.data.0.message', 'I can bring projection mapping and stage visuals.');
    }

    public function test_creator_cannot_apply_to_own_collaboration(): void
    {
        [$creator, , $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);

        $this->withToken($creator->createToken('test')->plainTextToken)
            ->postJson('/api/collaborations/'.$collaboration->id.'/apply', [
                'message' => 'Applying to myself.',
            ])->assertForbidden();
    }

    public function test_public_cannot_read_paused_collaboration_marked_public(): void
    {
        [$creator, , $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);
        $collaboration->update(['status' => 'paused']);

        $this->getJson('/api/collaborations?status=paused')
            ->assertOk()
            ->assertJsonCount(0, 'collaborations.data');

        $this->getJson('/api/collaborations/'.$collaboration->id)->assertForbidden();
    }

    public function test_applicant_cannot_update_application_status(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $collaboration = $this->createCollaboration($creator, $country, $city);
        $application = $collaboration->applications()->create([
            'user_id' => $applicant->id,
            'message' => 'Please review.',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $this->withToken($applicant->createToken('applicant')->plainTextToken)
            ->putJson('/api/collaborations/'.$collaboration->id.'/applications/'.$application->id, [
                'status' => 'accepted',
            ])->assertForbidden();
    }

    public function test_collective_admin_can_update_application_status(): void
    {
        [$creator, $applicant, $country, $city] = $this->context();
        $admin = User::factory()->create();
        $collective = Collective::factory()->create(['owner_user_id' => $creator->id]);
        $collective->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $collaboration = $this->createCollaboration($creator, $country, $city);
        $collaboration->update(['collective_id' => $collective->id]);
        $application = $collaboration->applications()->create([
            'user_id' => $applicant->id,
            'message' => 'Please review.',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $this->assertTrue($admin->can('updateApplication', $collaboration->fresh()));

        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->putJson('/api/collaborations/'.$collaboration->id.'/applications/'.$application->id, [
                'status' => 'accepted',
            ])->assertOk()
            ->assertJsonPath('application.status', 'accepted');

        $this->assertDatabaseHas('collaboration_applications', [
            'id' => $application->id,
            'status' => 'accepted',
        ]);
    }

    private function context(): array
    {
        $this->seed(GeographySeeder::class);

        $country = Country::query()->where('iso2', 'IT')->firstOrFail();
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $creator = User::factory()->create(['username' => 'creator']);
        $applicant = User::factory()->create(['username' => 'applicant']);

        return [$creator, $applicant, $country, $city];
    }

    private function createCollaboration(User $creator, Country $country, City $city): Collaboration
    {
        return Collaboration::query()->create([
            'user_id' => $creator->id,
            'country_id' => $country->id,
            'city_id' => $city->id,
            'title' => 'Open creative call',
            'description' => 'Looking for makers for a night of experiments.',
            'type' => 'open_creative_call',
            'status' => 'open',
            'visibility' => 'public',
            'remote_type' => 'local',
            'deadline_at' => now()->addMonth(),
        ]);
    }
}
