<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\AttachEventMediaRequest;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventAttendeeResource;
use App\Http\Resources\EventResource;
use App\Models\City;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::query()
            ->publiclyVisible()
            ->with($this->eventRelations(preview: true))
            ->when($request->query('country_id'), fn ($query, $countryId) => $query->where('country_id', $countryId))
            ->when($request->query('city_id'), fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->orderBy('starts_at')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'events' => [
                'data' => EventResource::collection($events->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ],
            ],
        ]);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = DB::transaction(function () use ($request): Event {
            $data = $request->validated();
            $city = City::query()->findOrFail($data['city_id']);

            $event = Event::query()->create([
                ...Arr::only($data, [
                    'title',
                    'slug',
                    'description',
                    'type',
                    'country_id',
                    'city_id',
                    'area_id',
                    'venue_id',
                    'collective_id',
                    'starts_at',
                    'ends_at',
                    'visibility',
                    'status',
                    'ticket_url',
                    'capacity',
                ]),
                'slug' => $data['slug'] ?? Str::slug($data['title']),
                'timezone' => $data['timezone'] ?? $city->timezone ?? config('app.timezone'),
                'organizer_user_id' => $request->user()->id,
                'published_at' => $data['status'] === 'published' ? now() : null,
            ]);

            $this->syncMoods($event, $data['mood_ids'] ?? []);
            $this->syncLineup($event, $data);

            return $event;
        });

        return response()->json([
            'message' => 'Event created.',
            'event' => new EventResource($this->loadEvent($event)),
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return response()->json([
            'event' => new EventResource($this->loadEvent($event)),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        DB::transaction(function () use ($request, $event): void {
            $data = $request->validated();
            $city = City::query()->findOrFail($data['city_id']);

            $event->update([
                ...Arr::only($data, [
                    'title',
                    'slug',
                    'description',
                    'type',
                    'country_id',
                    'city_id',
                    'area_id',
                    'venue_id',
                    'collective_id',
                    'starts_at',
                    'ends_at',
                    'visibility',
                    'status',
                    'ticket_url',
                    'capacity',
                ]),
                'slug' => $data['slug'] ?? Str::slug($data['title']),
                'timezone' => $data['timezone'] ?? $city->timezone ?? config('app.timezone'),
                'published_at' => $event->published_at ?? ($data['status'] === 'published' ? now() : null),
            ]);

            $this->syncMoods($event, $data['mood_ids'] ?? []);
            $this->syncLineup($event, $data);
        });

        return response()->json([
            'message' => 'Event updated.',
            'event' => new EventResource($this->loadEvent($event)),
        ]);
    }

    public function attend(Request $request, Event $event): JsonResponse
    {
        $this->authorize('attend', $event);

        $event->attendees()->syncWithoutDetaching([
            $request->user()->id => [
                'status' => 'going',
                'source' => 'organic',
                'updated_at' => now(),
                'created_at' => now(),
            ],
        ]);

        return response()->json([
            'message' => 'Attendance saved.',
            'event' => new EventResource($this->loadEvent($event)),
        ]);
    }

    public function unattend(Request $request, Event $event): JsonResponse
    {
        $event->attendees()->detach($request->user()->id);

        return response()->json([
            'message' => 'Attendance removed.',
        ]);
    }

    public function attachMedia(AttachEventMediaRequest $request, Event $event): JsonResponse
    {
        $data = $request->validated();

        $event->media()->syncWithoutDetaching([
            $data['media_item_id'] => [
                'type' => $data['type'] ?? 'gallery',
                'status' => $data['status'] ?? 'active',
                'sort_order' => $data['sort_order'] ?? 0,
                'updated_at' => now(),
                'created_at' => now(),
            ],
        ]);

        return response()->json([
            'message' => 'Event media attached.',
            'event' => new EventResource($this->loadEvent($event)),
        ], 201);
    }

    public function attendees(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $attendees = $event->attendees()
            ->orderByPivot('created_at', 'desc')
            ->paginate(30);

        return response()->json([
            'attendees' => [
                'data' => EventAttendeeResource::collection($attendees->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $attendees->currentPage(),
                    'last_page' => $attendees->lastPage(),
                    'per_page' => $attendees->perPage(),
                    'total' => $attendees->total(),
                ],
            ],
        ]);
    }

    private function loadEvent(Event $event): Event
    {
        return $event->fresh($this->eventRelations());
    }

    private function eventRelations(bool $preview = false): array
    {
        return [
            'organizer.profiles' => fn ($query) => $query->publiclyVisible(),
            'country',
            'city',
            'venue',
            'collective.profile',
            'coverMedia' => fn ($query) => $query->where('processing_status', 'ready'),
            'moods',
            'lineups' => fn ($query) => $query->with([
                'user.profiles' => fn ($query) => $query->publiclyVisible(),
                'profile' => fn ($query) => $query->publiclyVisible(),
                'collective.profile',
            ])->orderBy('sort_order'),
            'media' => fn ($query) => $query->where('processing_status', 'ready')->wherePivot('status', 'active')->orderByPivot('sort_order')->limit($preview ? 3 : 12),
            'attendees' => fn ($query) => $query->limit($preview ? 3 : 12),
        ];
    }

    private function syncMoods(Event $event, array $moodIds): void
    {
        $event->moods()->sync(collect($moodIds)->mapWithKeys(fn (int $id) => [
            $id => [
                'source' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ])->all());
    }

    private function syncLineup(Event $event, array $data): void
    {
        $event->lineups()->delete();

        $lineup = collect($data['lineup'] ?? []);

        $artistLineup = collect($data['lineup_artist_ids'] ?? [])
            ->map(fn (int $userId, int $index) => [
                'user_id' => $userId,
                'role' => 'artist',
                'sort_order' => $index,
                'status' => 'confirmed',
            ]);

        $lineup->merge($artistLineup)
            ->values()
            ->each(function (array $item, int $index) use ($event): void {
                $event->lineups()->create([
                    'user_id' => $item['user_id'] ?? null,
                    'collective_id' => $item['collective_id'] ?? null,
                    'profile_id' => $item['profile_id'] ?? null,
                    'name_override' => $item['name_override'] ?? null,
                    'role' => $item['role'] ?? 'artist',
                    'sort_order' => $item['sort_order'] ?? $index,
                    'status' => $item['status'] ?? 'confirmed',
                ]);
            });
    }
}
