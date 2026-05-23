<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collective\StoreCollectiveRequest;
use App\Http\Requests\Collective\UpdateCollectiveRequest;
use App\Http\Resources\CollectiveMemberResource;
use App\Http\Resources\CollectiveResource;
use App\Http\Resources\CollaborationResource;
use App\Http\Resources\EventResource;
use App\Models\Collective;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class CollectiveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $collectives = Collective::query()
            ->publiclyVisible()
            ->with([
                'country',
                'city',
                'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
                'owner.profiles' => fn ($query) => $query->publiclyVisible(),
            ])
            ->withCount(['members' => fn ($query) => $query->where('collective_members.status', 'active')])
            ->when($request->query('city_id'), fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->when($request->query('country_id'), fn ($query, $countryId) => $query->where('country_id', $countryId))
            ->when($request->query('recruiting_status'), fn ($query, $status) => $query->where('recruiting_status', $status))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'collectives' => [
                'data' => CollectiveResource::collection($collectives->getCollection())->resolve(),
                'meta' => $this->meta($collectives),
            ],
        ]);
    }

    public function store(StoreCollectiveRequest $request): JsonResponse
    {
        $data = $request->validated();

        $collective = Collective::query()->create([
            ...Arr::only($data, ['name', 'slug', 'manifesto', 'description', 'country_id', 'city_id', 'area_id', 'cover_media_id', 'recruiting_status']),
            'owner_user_id' => $request->user()->id,
            'type' => $data['type'] ?? 'collective',
            'status' => $data['status'] ?? 'active',
            'visibility' => $data['visibility'] ?? 'public',
        ]);

        $collective->members()->attach($request->user()->id, [
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Collective created.',
            'collective' => new CollectiveResource($this->loadCollective($collective)),
        ], 201);
    }

    public function show(Collective $collective): JsonResponse
    {
        $this->authorize('view', $collective);

        return response()->json([
            'collective' => new CollectiveResource($this->loadCollective($collective)),
        ]);
    }

    public function update(UpdateCollectiveRequest $request, Collective $collective): JsonResponse
    {
        $data = $request->validated();

        $collective->update([
            ...Arr::only($data, ['name', 'slug', 'manifesto', 'description', 'country_id', 'city_id', 'area_id', 'cover_media_id', 'recruiting_status']),
            'type' => $data['type'] ?? $collective->type,
            'status' => $data['status'] ?? $collective->status,
            'visibility' => $data['visibility'] ?? $collective->visibility,
        ]);

        return response()->json([
            'message' => 'Collective updated.',
            'collective' => new CollectiveResource($this->loadCollective($collective)),
        ]);
    }

    public function joinRequest(Request $request, Collective $collective): JsonResponse
    {
        $this->authorize('join', $collective);

        $collective->members()->syncWithoutDetaching([
            $request->user()->id => [
                'role' => 'member',
                'status' => 'invited',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        return response()->json([
            'message' => 'Join request submitted.',
        ], 201);
    }

    public function approveMember(Request $request, Collective $collective, User $user): JsonResponse
    {
        $this->authorize('approveMember', $collective);

        abort_unless($collective->members()->where('users.id', $user->id)->exists(), 404);

        $collective->members()->updateExistingPivot($user->id, [
            'role' => 'member',
            'status' => 'active',
            'joined_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Member approved.',
            'member' => new CollectiveMemberResource($user->load('profiles')),
        ]);
    }

    public function members(Collective $collective): JsonResponse
    {
        $this->authorize('view', $collective);

        $members = $collective->members()
            ->with(['profiles' => fn ($query) => $query->publiclyVisible()])
            ->orderByPivot('created_at')
            ->paginate(30);

        return response()->json([
            'members' => [
                'data' => CollectiveMemberResource::collection($members->getCollection())->resolve(),
                'meta' => $this->meta($members),
            ],
        ]);
    }

    public function events(Collective $collective): JsonResponse
    {
        $this->authorize('view', $collective);

        $events = $collective->events()
            ->publiclyVisible()
            ->with([
                'city',
                'country',
                'venue',
                'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
                'moods',
                'lineups.user.profiles' => fn ($query) => $query->publiclyVisible(),
            ])
            ->orderBy('starts_at')
            ->paginate(20);

        return response()->json([
            'events' => [
                'data' => EventResource::collection($events->getCollection())->resolve(),
                'meta' => $this->meta($events),
            ],
        ]);
    }

    public function collaborations(Collective $collective): JsonResponse
    {
        $this->authorize('view', $collective);

        $collaborations = $collective->collaborations()
            ->publiclyVisible()
            ->with(['user.profiles' => fn ($query) => $query->publiclyVisible(), 'country', 'city', 'event.city'])
            ->withCount('applications')
            ->latest()
            ->paginate(20);

        return response()->json([
            'collaborations' => [
                'data' => CollaborationResource::collection($collaborations->getCollection())->resolve(),
                'meta' => $this->meta($collaborations),
            ],
        ]);
    }

    private function loadCollective(Collective $collective): Collective
    {
        return $collective->fresh([
            'country',
            'city',
            'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
            'owner.profiles' => fn ($query) => $query->publiclyVisible(),
            'profile' => fn ($query) => $query->publiclyVisible(),
        ])
            ->loadCount(['members' => fn ($query) => $query->where('collective_members.status', 'active')]);
    }

    private function meta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
