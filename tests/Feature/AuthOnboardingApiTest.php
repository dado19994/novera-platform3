<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\CreativeIdentity;
use App\Models\Mood;
use App\Models\User;
use Database\Seeders\CreativeIdentitySeeder;
use Database\Seeders\GeographySeeder;
use Database\Seeders\MoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthOnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Novera User',
            'username' => 'novera_user',
            'email' => 'novera@example.com',
            'password' => 'password-secret',
            'password_confirmation' => 'password-secret',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Registered successfully.')
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'uuid',
                    'username',
                    'email',
                    'onboarding_completed',
                ],
            ])
            ->assertJsonPath('user.username', 'novera_user')
            ->assertJsonPath('user.onboarding_completed', false);

        $this->assertDatabaseHas('users', [
            'email' => 'novera@example.com',
            'username' => 'novera_user',
            'onboarding_completed' => false,
        ]);
    }

    public function test_user_can_login_and_receive_token(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password-secret'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password-secret',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Logged in successfully.')
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_user_can_complete_onboarding_with_profile_identities_and_moods(): void
    {
        $this->seed([
            GeographySeeder::class,
            CreativeIdentitySeeder::class,
            MoodSeeder::class,
        ]);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $city = City::query()->where('slug', 'rome')->firstOrFail();
        $identityIds = CreativeIdentity::query()->limit(2)->pluck('id')->all();
        $moodIds = Mood::query()->limit(3)->pluck('id')->all();

        $this->withToken($token)->putJson('/api/onboarding/profile', [
            'display_name' => 'Ada Novera',
            'username' => 'ada_novera',
            'city_id' => $city->id,
            'short_bio' => 'A cinematic maker exploring local scenes.',
        ])->assertOk()
            ->assertJsonPath('profile.display_name', 'Ada Novera')
            ->assertJsonPath('profile.short_bio', 'A cinematic maker exploring local scenes.');

        $this->withToken($token)->putJson('/api/onboarding/identities', [
            'creative_identity_ids' => $identityIds,
            'primary_creative_identity_id' => $identityIds[0],
            'availability_status' => 'open',
        ])->assertOk()
            ->assertJsonCount(2, 'creative_identities');

        $this->withToken($token)->putJson('/api/onboarding/moods', [
            'mood_ids' => $moodIds,
        ])->assertOk()
            ->assertJsonCount(3, 'moods');

        $this->withToken($token)->postJson('/api/onboarding/complete')
            ->assertOk()
            ->assertJsonPath('message', 'Onboarding completed.')
            ->assertJsonPath('user.onboarding_completed', true)
            ->assertJsonPath('user.onboarding_status', 'completed');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'ada_novera',
            'onboarding_completed' => true,
            'onboarding_status' => 'completed',
        ]);
    }
}
