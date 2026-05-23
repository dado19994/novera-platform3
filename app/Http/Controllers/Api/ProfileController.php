<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\CollaborationResource;
use App\Http\Resources\CreativeProfileResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\TrackResource;
use App\Models\City;
use App\Models\Collaboration;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(string $username): JsonResponse
    {
        $user = $this->resolveUser($username);

        return response()->json([
            'profile' => new CreativeProfileResource($this->profilePayload($user, publicOnly: true)),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => new CreativeProfileResource($this->profilePayload($request->user(), publicOnly: false)),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $city = City::query()->with('country')->findOrFail($data['city_id']);

        $user->forceFill([
            'name' => $data['display_name'],
            'username' => $data['username'],
            'home_country_id' => $city->country_id,
            'home_city_id' => $city->id,
            'home_area_id' => $data['area_id'] ?? null,
        ])->save();

        $profile = $user->profiles()->updateOrCreate(
            ['type' => 'user'],
            [
                'handle' => $data['username'],
                'display_name' => $data['display_name'],
                'bio' => $data['short_bio'],
                'tagline' => $data['tagline'] ?? null,
                'country_id' => $city->country_id,
                'city_id' => $city->id,
                'area_id' => $data['area_id'] ?? null,
                'website_url' => $data['website_url'] ?? null,
                'visibility' => $data['visibility'] ?? 'public',
                'status' => 'active',
            ],
        );

        return response()->json([
            'message' => 'Profile updated.',
            'profile' => new ProfileResource($profile->load(['city', 'country', 'moods'])),
        ]);
    }

    public function media(string $username): JsonResponse
    {
        $user = $this->resolveUser($username);
        $this->publicProfile($user);

        $posts = Post::query()
            ->publiclyVisible()
            ->with(['primaryMedia' => fn ($query) => $query->where('processing_status', 'ready')])
            ->whereHas('primaryMedia', fn ($query) => $query->where('processing_status', 'ready'))
            ->where('user_id', $user->id)
            ->latest('published_at')
            ->latest('id')
            ->paginate(20);

        return $this->paginatedResponse('media', $posts, PostResource::class);
    }

    public function tracks(string $username): JsonResponse
    {
        $user = $this->resolveUser($username);
        $this->publicProfile($user);

        $tracks = Track::query()
            ->publiclyVisible()
            ->with([
                'audio' => fn ($query) => $query->where('processing_status', 'ready'),
                'artwork' => fn ($query) => $query->where('processing_status', 'ready'),
            ])
            ->where('user_id', $user->id)
            ->latest('published_at')
            ->latest('id')
            ->paginate(20);

        return $this->paginatedResponse('tracks', $tracks, TrackResource::class);
    }

    public function events(string $username): JsonResponse
    {
        $user = $this->resolveUser($username);
        $this->publicProfile($user);

        $events = $this->eventsQuery($user)
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->paginate(20);

        return $this->paginatedResponse('events', $events, EventResource::class);
    }

    public function collaborations(string $username): JsonResponse
    {
        $user = $this->resolveUser($username);
        $this->publicProfile($user);

        $collaborations = $this->collaborationsQuery($user)
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse('collaborations', $collaborations, CollaborationResource::class);
    }

    private function resolveUser(string $username): User
    {
        $user = User::query()
            ->where('username', $username)
            ->first();

        if ($user) {
            return $user;
        }

        $profile = Profile::query()
            ->where('handle', $username)
            ->where('profileable_type', User::class)
            ->firstOrFail();

        return User::query()->findOrFail($profile->profileable_id);
    }

    private function profilePayload(User $user, bool $publicOnly): array
    {
        $profile = $publicOnly
            ? $this->publicProfile($user)->load([
                'city',
                'country',
                'moods',
                'avatar' => fn ($query) => $query->where('user_id', $user->id)->where('processing_status', 'ready'),
                'cover' => fn ($query) => $query->where('user_id', $user->id)->where('processing_status', 'ready'),
            ])
            : $user->profiles()->with(['city', 'country', 'moods', 'avatar', 'cover'])->where('type', 'user')->firstOrFail();

        $user->setRelation('profiles', collect([$profile]));
        $user->load([
            'creativeIdentities',
            'collectives' => fn ($query) => $query
                ->when($publicOnly, fn ($query) => $query->publiclyVisible())
                ->with('profile')
                ->wherePivot('status', 'active'),
        ]);

        $tracks = Track::query()
            ->publiclyVisible()
            ->with([
                'audio' => fn ($query) => $query->where('processing_status', 'ready'),
                'artwork' => fn ($query) => $query->where('processing_status', 'ready'),
            ])
            ->where('user_id', $user->id)
            ->latest('published_at')
            ->latest('id')
            ->limit(6)
            ->get();

        $upcomingEvents = $this->eventsQuery($user)
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(6)
            ->get();

        $openCollaborationsCount = $this->collaborationsQuery($user)->where('status', 'open')->count();

        $featuredMedia = $publicOnly
            ? Post::query()
                ->publiclyVisible()
                ->with(['primaryMedia' => fn ($query) => $query->where('processing_status', 'ready')->whereIn('type', ['image', 'video'])])
                ->where('user_id', $user->id)
                ->whereHas('primaryMedia', fn ($query) => $query->where('processing_status', 'ready')->whereIn('type', ['image', 'video']))
                ->latest('published_at')
                ->limit(6)
                ->get()
                ->pluck('primaryMedia')
                ->filter()
                ->values()
            : MediaItem::query()
                ->where('user_id', $user->id)
                ->where('processing_status', 'ready')
                ->whereIn('type', ['image', 'video'])
                ->latest()
                ->limit(6)
                ->get();

        return [
            'user' => $user,
            'profile' => $profile,
            'creative_identities' => $user->creativeIdentities,
            'moods' => $profile->moods,
            'city' => $profile->city,
            'country' => $profile->country,
            'featured_media' => $featuredMedia,
            'tracks' => $tracks,
            'upcoming_events' => $upcomingEvents,
            'collectives' => $user->collectives,
            'collaboration_status' => [
                'open_count' => $openCollaborationsCount,
                'is_open' => $openCollaborationsCount > 0,
            ],
        ];
    }

    private function eventsQuery(User $user): Builder
    {
        return Event::query()
            ->publiclyVisible()
            ->with(['city', 'venue', 'coverMedia' => fn ($query) => $query->where('processing_status', 'ready')])
            ->where(function (Builder $query) use ($user): void {
                $query->where('organizer_user_id', $user->id)
                    ->orWhereHas('lineups', fn (Builder $lineup) => $lineup->where('user_id', $user->id));
            });
    }

    private function collaborationsQuery(User $user): Builder
    {
        return Collaboration::query()
            ->publiclyVisible()
            ->with(['city'])
            ->where('user_id', $user->id);
    }

    private function publicProfile(User $user): Profile
    {
        return $user->profiles()
            ->publiclyVisible()
            ->where('type', 'user')
            ->firstOrFail();
    }

    private function paginatedResponse(string $key, LengthAwarePaginator $paginator, string $resourceClass): JsonResponse
    {
        return response()->json([
            $key => [
                'data' => $paginator->getCollection()
                    ->map(fn ($item) => (new $resourceClass($item))->resolve(request()))
                    ->values(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }
}
