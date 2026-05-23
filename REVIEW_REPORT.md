# Novera Laravel Backend Review Report

Review date: 2026-05-23  
Scope: migrations, MySQL compatibility, Eloquent relationships, policies, validation, API resources, tests, N+1/query risks, indexes, authentication security, naming consistency, and scalability.

## Executive Summary

The backend has a coherent initial Laravel API structure: Form Requests are used broadly, central domain policies exist for events, collectives, collaborations, and conversations, controllers generally eager-load response relationships, and the current feature suite passes. The most important gaps are authorization around public/private content and referenced entities. Several endpoints allow a user to expose or associate content they do not own, while public profile and content reads do not consistently enforce publication or visibility state.

Verification performed:

- `php artisan test`: passed after the security fixes, 58 tests and 305 assertions.
- `php artisan migrate:status` against the configured MySQL database: all five migrations are recorded as ran.
- Routes were inspected with middleware output: protected write/message/saved routes use `auth:sanctum`; `login` and `register` have no throttling middleware visible.
- Test execution is SQLite-only because [phpunit.xml](/Users/davidedignazio/progetti/novera-platform/phpunit.xml:26) sets `DB_CONNECTION=sqlite` and an in-memory database. A clean MySQL migration and MySQL feature-test run are not currently part of verification.

## Security Fixes Applied

- Public profile reads now require an active public profile, and public featured/media responses only expose ready media attached to published public posts. Covered by `ProfileApiTest::test_private_profile_is_not_readable_through_public_profile_endpoints` and `ProfileApiTest::test_public_profile_only_exposes_ready_media_from_published_public_posts`.
- Public visibility invariants are enforced through scoped queries and policies for profiles, posts, tracks, events, collaborations, and collectives: public visibility alone no longer exposes draft, unpublished, paused, or inactive records. Covered by `EventApiTest::test_draft_public_event_is_not_readable_by_the_public`, `CollaborationApiTest::test_public_cannot_read_paused_collaboration_marked_public`, `CollectiveApiTest::test_inactive_public_collective_is_not_publicly_readable`, and `MediaTrackStoryApiTest::test_draft_track_marked_public_is_not_readable_anonymously`.
- Saved items and reactions now authorize target visibility before accepting an entity, and saved-item serialization excludes targets that later become inaccessible. Covered by `EngagementApiTest::test_user_cannot_save_or_react_to_inaccessible_entities_or_media` and `EngagementApiTest::test_saved_item_stops_serializing_an_entity_after_it_becomes_private`.
- Referenced media ownership is enforced when attaching event media, setting a collective cover, or sending message media. Public profile avatar/cover/media reads are additionally limited to owned ready media; there is currently no writable profile avatar/cover API field to authorize. Covered by `EventApiTest::test_organizer_cannot_attach_another_users_media_to_an_event`, `CollectiveApiTest::test_collective_owner_cannot_use_another_users_media_as_cover`, and `MessagingApiTest::test_participant_cannot_send_another_users_media_in_a_message`.
- Collaboration submission ignores applicant-supplied workflow status and creates/updates applications as `pending`. A dedicated application status update endpoint now authorizes only the collaboration creator or active collective owners/admins. Covered by `CollaborationApiTest::test_user_can_apply_to_collaboration`, `CollaborationApiTest::test_applicant_cannot_update_application_status`, and `CollaborationApiTest::test_collective_admin_can_update_application_status`.

## Critical Issues

### C1. Public profile access can expose non-public profiles and unpublished media

**Evidence:** [ProfileController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/ProfileController.php:28) resolves any user/handle and returns a profile without checking profile `visibility` or `status`. In the same public payload, lines 183-189 load any ready image/video owned by that user, without requiring an associated public/published post. [ProfileResource.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Resources/ProfileResource.php:28) exposes visibility/status but does not guard access.

**Impact:** A user who makes a profile private, or uploads media that is ready but not published, can still have their profile and upload metadata/path returned by `GET /api/profiles/{username}`.

**Recommendation:** Authorize profile reads with a policy or public scope and derive public featured media only from published public posts (or introduce media visibility/publication rules). Add private-profile and unpublished-media regression tests.

### C2. Saved items can be used as an authenticated IDOR read channel

**Evidence:** [EngagementController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/EngagementController.php:78) saves any mapped entity found by primary key; `resolveEntity()` at line 118 has no visibility/ownership authorization. The response loads the entity, and [EngagementEntityResource.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Resources/EngagementEntityResource.php:28) serializes media, profiles, tracks, events, and collaborations, including media paths in [MediaItemResource.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Resources/MediaItemResource.php:12).

**Impact:** Any authenticated user who guesses/enumerates an ID can call `POST /api/saved` to retrieve private draft entities or another user's media metadata/path.

**Recommendation:** Replace `findOrFail()` with entity-specific view authorization/public scopes before saving or reacting; do not serialize an inaccessible saved target. Prefer UUID route identifiers where enumeration matters. Add denial tests for private profiles, draft tracks/events, and foreign media.

### C3. Foreign media can be attached to public responses or private messages without ownership/access checks

**Evidence:** Event media attachment validates only existence in [AttachEventMediaRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Event/AttachEventMediaRequest.php:14), then attaches it in [EventController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/EventController.php:164). Messages accept any existing `media_item_id` in [StoreMessageRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Message/StoreMessageRequest.php:15) and serialize it in [ConversationController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/ConversationController.php:111). Collective covers have the same pattern in [StoreCollectiveRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Collective/StoreCollectiveRequest.php:15) and [CollectiveController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollectiveController.php:41).

**Impact:** A user can make another user's media appear on their public event/collective or transmit its path in a conversation, bypassing the media owner's intent.

**Recommendation:** Require referenced media to be owned by the caller or explicitly shareable, and validate expected media type/purpose. Cover event attachments, collective covers, and message media with cross-owner tests.

### C4. Draft/unpublished records are publicly readable when marked `public`

**Evidence:** `EventPolicy::view()` permits any `visibility === 'public'` event regardless of status in [EventPolicy.php](/Users/davidedignazio/progetti/novera-platform/app/Policies/EventPolicy.php:15); the public index accepts arbitrary requested status in [EventController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/EventController.php:21). The same issue exists for collaborations in [CollaborationPolicy.php](/Users/davidedignazio/progetti/novera-platform/app/Policies/CollaborationPolicy.php:15) and [CollaborationController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollaborationController.php:19), collectives in [CollectivePolicy.php](/Users/davidedignazio/progetti/novera-platform/app/Policies/CollectivePolicy.php:15) and [CollectiveController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollectiveController.php:20), and tracks in [TrackController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/TrackController.php:54).

**Impact:** Draft, paused, closed, or otherwise non-public workflow states can be read by anonymous clients if their visibility is `public`, including by passing status filters.

**Recommendation:** Define a single public-publish invariant per entity (`published/active/open` plus `public`) and enforce it in policies and public query scopes; reserve non-public status filtering for authorized owners/managers.

### C5. Applicants control their own application workflow status

**Evidence:** [ApplyToCollaborationRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Collaboration/ApplyToCollaborationRequest.php:14) accepts arbitrary `status`, and [CollaborationController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollaborationController.php:86) writes that value during submission/resubmission.

**Impact:** An applicant can submit values such as `accepted` or other future privileged states, corrupting workflow integrity and potentially appearing approved to clients.

**Recommendation:** Force the submission status server-side to `submitted`; add manager-only status transition endpoints with enumerated transitions and authorization.

## Medium Issues

### M1. Association validation allows false attribution to collectives, events, users, and locations

`StoreEventRequest`, `StoreCollaborationRequest`, `StoreStoryRequest`, and messaging requests use `exists` checks for related `collective_id`, `event_id`, lineup user/profile IDs, and geographical IDs without checking managerial rights or parent consistency. Examples are [StoreEventRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Event/StoreEventRequest.php:21), [StoreCollaborationRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Collaboration/StoreCollaborationRequest.php:22), and [StoreStoryRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Story/StoreStoryRequest.php:16).

Require membership/ownership for branded associations and validate `area.city_id`, `city.country_id`, and venue location coherence using scoped validation rules or domain services.

### M2. Authentication hardening is incomplete

`POST /api/login` and `POST /api/register` are unthrottled in [api.php](/Users/davidedignazio/progetti/novera-platform/routes/api.php:17), login issues a token without checking active/suspended status in [AuthController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/AuthController.php:35), and Sanctum tokens have no global expiration in [sanctum.php](/Users/davidedignazio/progetti/novera-platform/config/sanctum.php:43). Password hashing is correctly protected by the `hashed` cast in [User.php](/Users/davidedignazio/progetti/novera-platform/app/Models/User.php:50).

Add login/register rate limits, token expiration/rotation policy, suspended/deleted-account handling, and decide whether email verification is required before mutations.

### M3. Enumerated domain fields are mostly accepted as arbitrary strings

Several workflow/security-relevant values accept only `string|max`, including event `status`/`visibility`, collective `status`/`visibility`/`recruiting_status`, collaboration `status`/`visibility`/`remote_type`, story visibility, and event-media status. For example, see [StoreEventRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Event/StoreEventRequest.php:26) and [StoreCollectiveRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Collective/StoreCollectiveRequest.php:26).

Use `Rule::in()` or backed enums and permit status transitions only through authorized workflows.

### M4. Pagination is not bounded and discovery ranks in application memory

Public indexes accept raw client `per_page` values, such as [EventController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/EventController.php:31), [CollaborationController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollaborationController.php:30), [CollectiveController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/CollectiveController.php:31), and [StoryController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/StoryController.php:50). Discovery pulls up to 50/100 records and ranks collections in PHP in [DiscoveryController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/DiscoveryController.php:25).

Clamp page size (for example, `1..50`), validate filters, and plan database/search-engine ranking once catalogue size grows.

### M5. Saved-items serialization contains an N+1 pattern

[EngagementController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/EngagementController.php:56) eager-loads only polymorphic `saveable`. Each saved entity is then individually `loadMissing()`-loaded with nested relationships inside [EngagementEntityResource.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Resources/EngagementEntityResource.php:28). A page of tracks/events/profiles can therefore generate relationship queries per item.

Use `morphWith()`/`loadMorph()` with defined relation sets before resource serialization and add a query-count test for a heterogeneous saved-items page.

### M6. High-traffic filters lack matching compound indexes

The migration contains many single-column indexes and some city/status/date indexes, but public query patterns also filter on visibility and order by date. In [2026_05_22_210000_create_novera_domain_tables.php](/Users/davidedignazio/progetti/novera-platform/database/migrations/2026_05_22_210000_create_novera_domain_tables.php:217), event indexes omit `visibility`; collaborations at line 369 and collectives at line 166 similarly lack public-feed composites. Messaging filters participants by user/status and sorts conversations by last-message time, while line 446 has no `(user_id, status, conversation_id)`-oriented lookup index.

Use `EXPLAIN` against representative MySQL data, then consider composites for public feeds and conversation listing rather than adding indexes speculatively.

### M7. Database constraints do not enforce assumptions used by models/controllers

`profiles` has no uniqueness constraint for one profile type per polymorphic owner, although code repeatedly calls `profiles()->...->first()` or `updateOrCreate(['type' => 'user'])` ([migration](/Users/davidedignazio/progetti/novera-platform/database/migrations/2026_05_22_210000_create_novera_domain_tables.php:102), [ProfileController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/ProfileController.php:58)). Also, `user_creative_identity` uses a unique key containing nullable `profile_id` at migration line 127; MySQL permits multiple rows when a unique-key component is `NULL`.

Choose the intended cardinality and enforce it at database level, accounting explicitly for MySQL nullable-unique behavior.

### M8. MySQL compatibility is deployed but not protected by tests

The configured MySQL database reports all current migrations applied, and no obvious MySQL-incompatible schema construct was found. However, [phpunit.xml](/Users/davidedignazio/progetti/novera-platform/phpunit.xml:26) executes all automated tests on SQLite; foreign-key behavior, nullable unique keys, execution plans, and collation/case behavior can diverge on MySQL.

Add a MySQL CI job that runs `migrate:fresh --seed` and feature tests on an ephemeral database before production schema growth continues.

## Improvements

- Introduce policies/public query scopes for `Profile`, `Track`, `MediaItem`, `Story`, `Post`, `Reaction`, and `SavedItem`; current policy coverage is partial.
- Use API resources consistently. [EventResource.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Resources/EventResource.php:35) returns a raw loaded venue rather than a controlled `VenueResource`.
- Avoid returning internal storage `disk` and `path` as public API contracts unless clients truly need them; prefer an authorized delivery URL or media identifier.
- Restrict upload disks. [StoreMediaRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Media/StoreMediaRequest.php:22) permits any string disk and [MediaController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/MediaController.php:17) uses it directly.
- Review onboarding media ingestion: [FirstMediaRequest.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Requests/Onboarding/FirstMediaRequest.php:14) accepts client-provided disk/path/MIME and [OnboardingController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/OnboardingController.php:119) publishes it immediately rather than tying it to a verified upload.
- Consolidate naming: `cover_media_id` versus `cover_media_item_id`, `media_id` versus `media_item_id`, input `deadline` versus database `deadline_at`, and creator `user_id` versus response `creator_id` increase contract ambiguity.
- Resolve the duplicate collective/venue profile representations: each has both a `profile_id` FK and a polymorphic `profile()` relationship, but response code uses the polymorphic relationship.
- Remove unnecessary eager loading of `profileable.tracks` in discovery artists at [DiscoveryController.php](/Users/davidedignazio/progetti/novera-platform/app/Http/Controllers/Api/DiscoveryController.php:98), as the discovery artist resource does not serialize tracks.
- Replace broadly `protected $guarded = []` domain models with intentional fillable fields or consistently encapsulated write services to reduce future mass-assignment mistakes.

## Test Gaps

The existing tests cover core happy paths, messaging participant access, event/collaboration update denial, and saved/reaction deletion ownership. Missing tests should be treated as part of each fix:

- Anonymous/private/draft visibility tests for profiles, tracks, events, collectives, collaborations, stories, and nested resources.
- Cross-user media ID tests for saved items, event media, collective covers, messages, and profile/media presentation.
- Application status transition and collective/event attribution authorization tests.
- Validation tests for enum values and inconsistent city/country/area references.
- Rate-limit, inactive-user login, token expiry/revocation, and optional verified-email tests.
- Pagination bound and query-count/N+1 regression tests.
- MySQL migration and API test execution in CI.

## Next Recommended Tasks

1. Close read/IDOR leaks: add public scopes/policies for profiles/media/engagement targets and enforce publish-state checks in public show/index endpoints.
2. Lock down referenced IDs: require authorization for media, collective, event, lineup, and conversation associations; add cross-owner regression tests.
3. Secure workflow/auth inputs: server-control collaboration application status, enumerate status/visibility fields, throttle auth, and define token/account-state policy.
4. Add bounded pagination and eliminate saved-items `loadMissing()` N+1 behavior with polymorphic eager loading.
5. Add MySQL CI verification and then tune compound indexes using MySQL `EXPLAIN` on representative feed and messaging queries.
6. Reconcile schema/cardinality and naming decisions before further feature development, especially profiles and nullable pivot uniqueness.
