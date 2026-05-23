<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectiveResource;
use App\Http\Resources\CollaborationResource;
use App\Http\Resources\DiscoveryArtistResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\TrackResource;
use App\Models\City;
use App\Models\Collective;
use App\Models\Collaboration;
use App\Models\Event;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DiscoveryController extends Controller
{
    public function home(Request $request): JsonResponse
    {
        $context = $this->context($request);

        return response()->json([
            'featured_events' => EventResource::collection($this->rankEvents($this->eventsQuery($request)->limit(50)->get(), $context)->take(6)->values()),
            'emerging_artists' => DiscoveryArtistResource::collection($this->rankArtists($this->artistsQuery($request)->limit(50)->get(), $context)->take(6)->values()),
            'open_collaborations' => CollaborationResource::collection($this->rankCollaborations($this->collaborationsQuery($request)->limit(50)->get(), $context)->take(6)->values()),
            'collectives_near_you' => CollectiveResource::collection($this->rankCollectives($this->collectivesQuery($request)->limit(50)->get(), $context)->take(6)->values()),
            'tracks_to_discover' => TrackResource::collection($this->rankTracks($this->tracksQuery($request)->limit(50)->get(), $context)->take(6)->values()),
        ]);
    }

    public function city(Request $request, City $city): JsonResponse
    {
        $request->query->set('city_id', $city->id);
        $request->query->set('country_id', $city->country_id);

        return $this->home($request);
    }

    public function artists(Request $request): JsonResponse
    {
        return response()->json([
            'artists' => DiscoveryArtistResource::collection(
                $this->rankArtists($this->artistsQuery($request)->limit(100)->get(), $this->context($request))->values(),
            ),
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        return response()->json([
            'events' => EventResource::collection(
                $this->rankEvents($this->eventsQuery($request)->limit(100)->get(), $this->context($request))->values(),
            ),
        ]);
    }

    public function collaborations(Request $request): JsonResponse
    {
        return response()->json([
            'collaborations' => CollaborationResource::collection(
                $this->rankCollaborations($this->collaborationsQuery($request)->limit(100)->get(), $this->context($request))->values(),
            ),
        ]);
    }

    public function collectives(Request $request): JsonResponse
    {
        return response()->json([
            'collectives' => CollectiveResource::collection(
                $this->rankCollectives($this->collectivesQuery($request)->limit(100)->get(), $this->context($request))->values(),
            ),
        ]);
    }

    private function eventsQuery(Request $request): Builder
    {
        return Event::query()
            ->publiclyVisible()
            ->with([
                'country',
                'city',
                'venue',
                'collective.profile' => fn ($query) => $query->publiclyVisible(),
                'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
                'moods',
                'lineups.user.profiles' => fn ($query) => $query->publiclyVisible(),
            ])
            ->when($request->query('country_id'), fn ($query, $id) => $query->where('country_id', $id))
            ->when($request->query('city_id'), fn ($query, $id) => $query->where('city_id', $id))
            ->when($request->query('area_id'), fn ($query, $id) => $query->where('area_id', $id))
            ->when($request->query('event_type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->query('date_from'), fn ($query, $date) => $query->where('starts_at', '>=', $date))
            ->when($request->query('date_to'), fn ($query, $date) => $query->where('starts_at', '<=', $date))
            ->when($request->query('mood'), fn ($query, $mood) => $this->whereMood($query, $mood))
            ->orderBy('starts_at');
    }

    private function artistsQuery(Request $request): Builder
    {
        return Profile::query()
            ->with(['profileable.creativeIdentities', 'profileable.tracks', 'moods', 'city', 'country'])
            ->where('profileable_type', User::class)
            ->publiclyVisible()
            ->when($request->query('country_id'), fn ($query, $id) => $query->where('country_id', $id))
            ->when($request->query('city_id'), fn ($query, $id) => $query->where('city_id', $id))
            ->when($request->query('area_id'), fn ($query, $id) => $query->where('area_id', $id))
            ->when($request->query('mood'), fn ($query, $mood) => $this->whereMood($query, $mood))
            ->when($request->query('creative_identity'), function ($query, $identity): void {
                $query->whereHasMorph('profileable', [User::class], function ($userQuery) use ($identity): void {
                    $userQuery->whereHas('creativeIdentities', fn ($identityQuery) => $identityQuery->where('creative_identities.slug', $identity)->orWhere('creative_identities.id', $identity));
                });
            })
            ->latest();
    }

    private function collaborationsQuery(Request $request): Builder
    {
        return Collaboration::query()
            ->publiclyVisible()
            ->with([
                'user.profiles' => fn ($query) => $query->publiclyVisible(),
                'country',
                'city',
                'collective.profile' => fn ($query) => $query->publiclyVisible(),
                'event.city',
                'moods',
            ])
            ->withCount('applications')
            ->when($request->query('country_id'), fn ($query, $id) => $query->where('country_id', $id))
            ->when($request->query('city_id'), fn ($query, $id) => $query->where('city_id', $id))
            ->when($request->query('area_id'), fn ($query, $id) => $query->where('area_id', $id))
            ->when($request->query('collaboration_type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->query('date_to'), fn ($query, $date) => $query->where('deadline_at', '<=', $date))
            ->when($request->query('mood'), fn ($query, $mood) => $this->whereMood($query, $mood))
            ->latest();
    }

    private function collectivesQuery(Request $request): Builder
    {
        return Collective::query()
            ->publiclyVisible()
            ->with([
                'country',
                'city',
                'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
                'owner.profiles' => fn ($query) => $query->publiclyVisible(),
                'profile' => fn ($query) => $query->publiclyVisible(),
            ])
            ->withCount(['members' => fn ($query) => $query->where('collective_members.status', 'active')])
            ->when($request->query('country_id'), fn ($query, $id) => $query->where('country_id', $id))
            ->when($request->query('city_id'), fn ($query, $id) => $query->where('city_id', $id))
            ->when($request->query('area_id'), fn ($query, $id) => $query->where('area_id', $id))
            ->latest();
    }

    private function tracksQuery(Request $request): Builder
    {
        return Track::query()
            ->publiclyVisible()
            ->with([
                'audio' => fn ($query) => $query->where('processing_status', 'ready'),
                'artwork' => fn ($query) => $query->where('processing_status', 'ready'),
                'moods',
            ])
            ->when($request->query('city_id'), fn ($query, $id) => $query->where('city_id', $id))
            ->when($request->query('area_id'), fn ($query, $id) => $query->where('area_id', $id))
            ->when($request->query('mood'), fn ($query, $mood) => $this->whereMood($query, $mood))
            ->latest('published_at');
    }

    private function rankEvents(Collection $items, array $context): Collection
    {
        return $this->rank($items, $context, fn ($item) => $this->scorePlace($item, $context) + $this->scoreMoods($item, $context) + $this->scoreRecent($item->created_at) + 2);
    }

    private function rankArtists(Collection $profiles, array $context): Collection
    {
        return $profiles->map(function (Profile $profile) use ($context): array {
            $score = $this->scorePlace($profile, $context) + $this->scoreMoods($profile, $context) + $this->scoreRecent($profile->created_at);
            $identitySlugs = $profile->profileable?->creativeIdentities?->pluck('slug')->all() ?? [];

            if ($context['creative_identity'] && in_array($context['creative_identity'], $identitySlugs, true)) {
                $score += 25;
            }

            return [
                'score' => $score,
                'user' => $profile->profileable,
                'profile' => $profile,
                'creative_identities' => $profile->profileable?->creativeIdentities ?? collect(),
                'moods' => $profile->moods,
                'city' => $profile->city,
            ];
        })->sortByDesc('score')->values();
    }

    private function rankCollaborations(Collection $items, array $context): Collection
    {
        return $this->rank($items, $context, fn ($item) => $this->scorePlace($item, $context) + $this->scoreMoods($item, $context) + $this->scoreRecent($item->created_at) + 5);
    }

    private function rankCollectives(Collection $items, array $context): Collection
    {
        return $this->rank($items, $context, fn ($item) => $this->scorePlace($item, $context) + $this->scoreRecent($item->created_at) + ($item->recruiting_status === 'open' ? 8 : 0));
    }

    private function rankTracks(Collection $items, array $context): Collection
    {
        return $this->rank($items, $context, fn ($item) => $this->scorePlace($item, $context) + $this->scoreMoods($item, $context) + $this->scoreRecent($item->published_at ?? $item->created_at) + 2);
    }

    private function rank(Collection $items, array $context, callable $scorer): Collection
    {
        return $items->map(function ($item) use ($scorer) {
            $item->discovery_score = $scorer($item);

            return $item;
        })->sortByDesc('discovery_score')->values();
    }

    private function scorePlace($item, array $context): int
    {
        return (($context['city_id'] && (int) $item->city_id === (int) $context['city_id']) ? 30 : 0)
            + (($context['area_id'] && (int) $item->area_id === (int) $context['area_id']) ? 45 : 0);
    }

    private function scoreMoods($item, array $context): int
    {
        if (! $context['mood'] || ! $item->relationLoaded('moods')) {
            return 0;
        }

        return $item->moods->contains(fn ($mood) => $mood->slug === $context['mood'] || (string) $mood->id === (string) $context['mood']) ? 20 : 0;
    }

    private function scoreRecent($date): int
    {
        if (! $date) {
            return 0;
        }

        return $date->greaterThan(now()->subDays(7)) ? 10 : ($date->greaterThan(now()->subDays(30)) ? 5 : 0);
    }

    private function whereMood(Builder $query, string|int $mood): void
    {
        $query->whereHas('moods', fn ($moodQuery) => $moodQuery->where('moods.slug', $mood)->orWhere('moods.id', $mood));
    }

    private function context(Request $request): array
    {
        return [
            'country_id' => $request->query('country_id') ?? $request->user()?->home_country_id,
            'city_id' => $request->query('city_id') ?? $request->user()?->home_city_id,
            'area_id' => $request->query('area_id') ?? $request->user()?->home_area_id,
            'mood' => $request->query('mood'),
            'creative_identity' => $request->query('creative_identity'),
        ];
    }
}
