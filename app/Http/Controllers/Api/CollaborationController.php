<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\ApplyToCollaborationRequest;
use App\Http\Requests\Collaboration\StoreCollaborationRequest;
use App\Http\Requests\Collaboration\UpdateCollaborationApplicationRequest;
use App\Http\Requests\Collaboration\UpdateCollaborationRequest;
use App\Http\Resources\CollaborationApplicationResource;
use App\Http\Resources\CollaborationResource;
use App\Models\City;
use App\Models\Collaboration;
use App\Models\CollaborationApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class CollaborationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $collaborations = Collaboration::query()
            ->publiclyVisible()
            ->with($this->relations())
            ->withCount('applications')
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->query('country_id'), fn ($query, $countryId) => $query->where('country_id', $countryId))
            ->when($request->query('city_id'), fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'collaborations' => [
                'data' => CollaborationResource::collection($collaborations->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $collaborations->currentPage(),
                    'last_page' => $collaborations->lastPage(),
                    'per_page' => $collaborations->perPage(),
                    'total' => $collaborations->total(),
                ],
            ],
        ]);
    }

    public function store(StoreCollaborationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $creatorId = $data['creator_id'] ?? $request->user()->id;

        abort_if((int) $creatorId !== $request->user()->id, 403);

        $collaboration = Collaboration::query()->create($this->payload($data, $creatorId));

        return response()->json([
            'message' => 'Collaboration created.',
            'collaboration' => new CollaborationResource($this->loadCollaboration($collaboration)),
        ], 201);
    }

    public function show(Collaboration $collaboration): JsonResponse
    {
        $this->authorize('view', $collaboration);

        return response()->json([
            'collaboration' => new CollaborationResource($this->loadCollaboration($collaboration)),
        ]);
    }

    public function update(UpdateCollaborationRequest $request, Collaboration $collaboration): JsonResponse
    {
        abort_unless($this->canManage($request->user(), $collaboration), 403);

        $data = $request->validated();
        $creatorId = $data['creator_id'] ?? $collaboration->user_id;

        abort_if((int) $creatorId !== $collaboration->user_id, 403);

        $collaboration->update($this->payload($data, $collaboration->user_id));

        return response()->json([
            'message' => 'Collaboration updated.',
            'collaboration' => new CollaborationResource($this->loadCollaboration($collaboration)),
        ]);
    }

    public function apply(ApplyToCollaborationRequest $request, Collaboration $collaboration): JsonResponse
    {
        $data = $request->validated();
        $applicantId = $data['applicant_id'] ?? $request->user()->id;

        abort_if((int) $applicantId !== $request->user()->id, 403);

        $application = $collaboration->applications()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'message' => $data['message'],
                'status' => 'pending',
                'portfolio_url' => $data['portfolio_url'] ?? null,
                'submitted_at' => now(),
            ],
        );

        return response()->json([
            'message' => 'Application submitted.',
            'application' => new CollaborationApplicationResource($application->load('user')),
        ], 201);
    }

    public function applications(Request $request, Collaboration $collaboration): JsonResponse
    {
        abort_unless($this->canManage($request->user(), $collaboration), 403);

        $applications = $collaboration->applications()
            ->with('user.profiles')
            ->latest('submitted_at')
            ->paginate(30);

        return response()->json([
            'applications' => [
                'data' => CollaborationApplicationResource::collection($applications->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $applications->currentPage(),
                    'last_page' => $applications->lastPage(),
                    'per_page' => $applications->perPage(),
                    'total' => $applications->total(),
                ],
            ],
        ]);
    }

    public function updateApplication(
        UpdateCollaborationApplicationRequest $request,
        Collaboration $collaboration,
        CollaborationApplication $application,
    ): JsonResponse {
        $this->authorize('updateApplication', $collaboration);
        abort_unless($application->collaboration_id === $collaboration->id, 404);

        $application->update([
            'status' => $request->validated('status'),
        ]);

        return response()->json([
            'message' => 'Application status updated.',
            'application' => new CollaborationApplicationResource($application->load('user')),
        ]);
    }

    private function payload(array $data, int $creatorId): array
    {
        $city = City::query()->findOrFail($data['city_id']);

        return [
            ...Arr::only($data, [
                'title',
                'description',
                'type',
                'country_id',
                'city_id',
                'area_id',
                'collective_id',
                'event_id',
                'status',
                'needed_roles',
            ]),
            'country_id' => $data['country_id'] ?? $city->country_id,
            'user_id' => $creatorId,
            'deadline_at' => $data['deadline'] ?? null,
            'visibility' => $data['visibility'] ?? 'public',
            'remote_type' => $data['remote_type'] ?? 'local',
        ];
    }

    private function loadCollaboration(Collaboration $collaboration): Collaboration
    {
        return $collaboration->fresh($this->relations())->loadCount('applications');
    }

    private function relations(): array
    {
        return [
            'user.profiles' => fn ($query) => $query->publiclyVisible(),
            'country',
            'city',
            'collective.profile',
            'event.city',
        ];
    }

    private function canManage($user, Collaboration $collaboration): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->id === $collaboration->user_id) {
            return true;
        }

        if (! $collaboration->collective_id) {
            return false;
        }

        return $collaboration->collective()
            ->whereHas('members', function ($query) use ($user): void {
                $query->where('users.id', $user->id)
                    ->whereIn('collective_members.role', ['owner', 'admin', 'editor'])
                    ->where('collective_members.status', 'active');
            })
            ->exists();
    }
}
