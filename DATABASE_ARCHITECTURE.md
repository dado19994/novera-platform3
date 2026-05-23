# Novera Database Architecture

This document defines the planned Laravel + MySQL database architecture for Novera V1. It is based on `PRODUCT_SPECIFICATION.md` and is intended as a migration-ready design reference, not an implementation.

No migrations are created by this document.

## Architecture Principles

- Use MySQL-compatible column types only.
- Use Laravel-friendly conventions: `id` primary keys, `created_at`, `updated_at`, nullable `deleted_at` where soft deletes are useful.
- Use foreign keys for direct ownership and stable relationships.
- Use polymorphic tables for reusable behaviors: media attachment, moods, reactions, saves, recommendation signals, and profiles.
- Index high-traffic filters: `user_id`, `city_id`, `type`, `status`, `created_at`.
- Store files in object storage, not MySQL. MySQL stores metadata, paths, ownership, processing state, and relationships.
- Keep recommendation and AI-adjacent data as signals and metadata, not as hard product dependencies.
- Avoid PostgreSQL-only features such as arrays, native enum dependencies, partial indexes, generated vector types, or JSONB.

## Shared Column Conventions

- Primary key: `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`.
- Foreign keys: `BIGINT UNSIGNED`, indexed, with explicit `ON DELETE` behavior.
- Public identifiers: optional `uuid CHAR(36)` for externally exposed resources.
- Slugs/handles: `VARCHAR(120)` or `VARCHAR(160)`, indexed or unique where required.
- Status/type fields: `VARCHAR(40)` or `VARCHAR(60)` rather than MySQL `ENUM`, to keep migrations flexible.
- Visibility fields: `VARCHAR(40)`, expected values include `public`, `unlisted`, `followers`, `private`, `draft`, `archived`.
- Coordinates: `DECIMAL(10,7)` for latitude and `DECIMAL(10,7)` for longitude.
- Money: future tables should use integer minor units, not floating point.
- JSON: use MySQL `JSON` only for flexible metadata, never as the only place for fields needed in filters or joins.

## Polymorphic Naming

Use Laravel morph columns:

- `profileable_type VARCHAR(120)`, `profileable_id BIGINT UNSIGNED`
- `mediable_type VARCHAR(120)`, `mediable_id BIGINT UNSIGNED`
- `moodable_type VARCHAR(120)`, `moodable_id BIGINT UNSIGNED`
- `reactionable_type VARCHAR(120)`, `reactionable_id BIGINT UNSIGNED`
- `saveable_type VARCHAR(120)`, `saveable_id BIGINT UNSIGNED`
- `signalable_type VARCHAR(120)`, `signalable_id BIGINT UNSIGNED`

Use compound indexes on every morph pair, usually with `created_at` or `type`.

## Tables

### users

Core authenticated accounts.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| name | VARCHAR(120) | Yes | Display/account name |
| email | VARCHAR(255) | No | Unique login email |
| email_verified_at | TIMESTAMP | Yes | Laravel-compatible verification |
| password | VARCHAR(255) | No | Hashed password |
| status | VARCHAR(40) | No | `active`, `restricted`, `suspended`, `deleted` |
| onboarding_status | VARCHAR(40) | No | `not_started`, `in_progress`, `completed` |
| home_country_id | BIGINT UNSIGNED | Yes | FK to `countries.id` |
| home_city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| home_area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| locale | VARCHAR(12) | Yes | Future localization |
| timezone | VARCHAR(80) | Yes | User timezone |
| last_login_at | TIMESTAMP | Yes | Security/audit |
| remember_token | VARCHAR(100) | Yes | Laravel remember token |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to optional home country, city, and area.
- Has many profiles through `profiles.profileable_type = User`.
- Has many selected creative identities through `user_creative_identity`.
- Owns posts, tracks, stories, collaborations, messages, reactions, saves, and recommendation signals.

**Indexes**

- `UNIQUE (uuid)`
- `UNIQUE (email)`
- `INDEX (status)`
- `INDEX (onboarding_status)`
- `INDEX (home_city_id)`
- `INDEX (home_area_id)`
- `INDEX (created_at)`
- `INDEX (deleted_at)`

**Scalability Notes**

- Keep authentication data lean; move security devices, MFA, and login history into separate tables later.
- `home_city_id` and `home_area_id` support local discovery without joining profiles.
- Soft deletes help moderation and account recovery, but anonymization policies may be needed later.

### profiles

Public-facing identity pages for users, collectives, venues, organizers, and future profile-bearing entities.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| profileable_type | VARCHAR(120) | No | Polymorphic owner model |
| profileable_id | BIGINT UNSIGNED | No | Polymorphic owner id |
| handle | VARCHAR(120) | No | Unique public handle |
| display_name | VARCHAR(160) | No | Public name |
| type | VARCHAR(40) | No | `user`, `collective`, `venue`, `organizer`, `project` |
| bio | TEXT | Yes | Public bio |
| tagline | VARCHAR(180) | Yes | Short public line |
| avatar_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| cover_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| country_id | BIGINT UNSIGNED | Yes | FK to `countries.id` |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| website_url | VARCHAR(2048) | Yes | External link |
| external_links | JSON | Yes | Flexible profile links |
| visibility | VARCHAR(40) | No | Public/private state |
| status | VARCHAR(40) | No | `active`, `restricted`, `archived` |
| featured_at | TIMESTAMP | Yes | Editorial/promoted readiness |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Morphs to user, collective, venue, or future entity.
- Belongs to optional avatar and cover media items.
- Belongs to country, city, and area.
- Can be reacted to or saved through polymorphic tables if desired later.

**Indexes**

- `UNIQUE (uuid)`
- `UNIQUE (handle)`
- `INDEX (profileable_type, profileable_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (created_at)`

**Scalability Notes**

- Polymorphic ownership prevents duplicating profile fields across users, collectives, and venues.
- If profile search becomes heavy, add a dedicated search index table or external search service later.
- Keep frequently filtered fields outside `external_links`.

### creative_identities

Canonical creative identity catalog: roles, disciplines, practices, and cultural participation types.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| name | VARCHAR(120) | No | Display label |
| slug | VARCHAR(140) | No | Unique slug |
| type | VARCHAR(40) | No | `role`, `discipline`, `skill`, `scene`, `intent` |
| parent_id | BIGINT UNSIGNED | Yes | FK to `creative_identities.id` |
| description | TEXT | Yes | Optional explanation |
| sort_order | INT UNSIGNED | No | UI ordering |
| status | VARCHAR(40) | No | `active`, `hidden`, `archived` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Self-references via `parent_id`.
- Belongs to many users through `user_creative_identity`.

**Indexes**

- `UNIQUE (slug)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (parent_id)`
- `INDEX (created_at)`

**Scalability Notes**

- This table can grow into a moderated taxonomy.
- Avoid storing user-specific identity text here; use the pivot for user-specific context.

### user_creative_identity

Enriched pivot connecting users to creative identities.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| creative_identity_id | BIGINT UNSIGNED | No | FK to `creative_identities.id` |
| profile_id | BIGINT UNSIGNED | Yes | FK to `profiles.id` |
| is_primary | TINYINT(1) | No | Primary role marker |
| proficiency | VARCHAR(40) | Yes | `emerging`, `experienced`, `professional` |
| availability_status | VARCHAR(40) | Yes | `open`, `selective`, `closed` |
| context | VARCHAR(255) | Yes | User-specific label/context |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to user.
- Belongs to creative identity.
- Optionally belongs to profile for profile-specific presentation.

**Indexes**

- `UNIQUE (user_id, creative_identity_id, profile_id)`
- `INDEX (user_id)`
- `INDEX (creative_identity_id)`
- `INDEX (profile_id)`
- `INDEX (availability_status)`
- `INDEX (created_at)`

**Scalability Notes**

- Allows a single taxonomy item to be reused across users.
- If users need full independent identity pages later, add a separate user-owned identity table rather than overloading this pivot.

### moods

Reusable mood and atmosphere taxonomy for tracks, posts, events, profiles, and recommendations.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| name | VARCHAR(100) | No | Display label |
| slug | VARCHAR(120) | No | Unique slug |
| type | VARCHAR(40) | No | `mood`, `energy`, `aesthetic`, `scene` |
| status | VARCHAR(40) | No | `active`, `hidden`, `archived` |
| sort_order | INT UNSIGNED | No | UI ordering |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to many models through `moodables`.

**Indexes**

- `UNIQUE (slug)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- Keep as controlled taxonomy for recommendation quality.
- Future localization can move translated labels into a separate table.

### moodables

Polymorphic pivot connecting moods to content and entities.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| mood_id | BIGINT UNSIGNED | No | FK to `moods.id` |
| moodable_type | VARCHAR(120) | No | Polymorphic target |
| moodable_id | BIGINT UNSIGNED | No | Polymorphic target id |
| weight | TINYINT UNSIGNED | Yes | Optional strength, 1-100 |
| source | VARCHAR(40) | No | `user`, `editorial`, `system`, `ai` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to mood.
- Morphs to posts, tracks, events, profiles, collectives, collaborations, or future models.

**Indexes**

- `UNIQUE (mood_id, moodable_type, moodable_id)`
- `INDEX (moodable_type, moodable_id)`
- `INDEX (mood_id)`
- `INDEX (source)`
- `INDEX (created_at)`

**Scalability Notes**

- Useful for invisible AI enrichment while preserving human/editable tags.
- If AI adds moods, keep `source = ai` and allow moderation overrides.

### media_items

Shared media metadata for images, video, audio files, thumbnails, covers, and generated derivatives.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| user_id | BIGINT UNSIGNED | Yes | FK to owner `users.id` |
| mediable_type | VARCHAR(120) | Yes | Optional polymorphic parent |
| mediable_id | BIGINT UNSIGNED | Yes | Optional polymorphic parent id |
| type | VARCHAR(40) | No | `image`, `video`, `audio`, `document`, `thumbnail` |
| disk | VARCHAR(80) | No | Laravel filesystem disk |
| path | VARCHAR(1024) | No | Storage path |
| original_filename | VARCHAR(255) | Yes | Original upload name |
| mime_type | VARCHAR(120) | No | MIME type |
| size_bytes | BIGINT UNSIGNED | No | File size |
| width | INT UNSIGNED | Yes | Image/video width |
| height | INT UNSIGNED | Yes | Image/video height |
| duration_seconds | DECIMAL(10,3) | Yes | Audio/video duration |
| alt_text | VARCHAR(500) | Yes | Accessibility |
| thumbnail_path | VARCHAR(1024) | Yes | Generated thumbnail |
| waveform_path | VARCHAR(1024) | Yes | Audio waveform |
| processing_status | VARCHAR(40) | No | `pending`, `processing`, `ready`, `failed` |
| metadata | JSON | Yes | Codec, EXIF, provider data |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to optional user owner.
- Optionally morphs directly to a parent model.
- Referenced by posts, tracks, stories, events, profiles, and messages.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (user_id)`
- `INDEX (mediable_type, mediable_id)`
- `INDEX (type)`
- `INDEX (processing_status)`
- `INDEX (created_at)`
- `INDEX (deleted_at)`

**Scalability Notes**

- Keep hot content tables from storing large file metadata repeatedly.
- For many-to-many attachments, use purpose-built pivots such as `event_media`; future `post_media` can be added if posts need ordered galleries beyond `media_items.mediable_*`.
- Large media processing should happen through queues.

### posts

Media-first posts and cultural updates.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` when posted as collective |
| profile_id | BIGINT UNSIGNED | Yes | FK to publishing profile |
| event_id | BIGINT UNSIGNED | Yes | FK to `events.id` |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| type | VARCHAR(40) | No | `media`, `text`, `announcement`, `event_update` |
| status | VARCHAR(40) | No | `draft`, `published`, `hidden`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| caption | TEXT | Yes | Main text |
| primary_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| metadata | JSON | Yes | Flexible future metadata |
| published_at | TIMESTAMP | Yes | Publication time |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to user.
- Optionally belongs to collective, profile, event, city, and area.
- May have media via `media_items.mediable_type = Post`.
- Can have moods, reactions, saves, and recommendation signals polymorphically.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (user_id)`
- `INDEX (collective_id)`
- `INDEX (profile_id)`
- `INDEX (event_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (published_at)`
- `INDEX (created_at)`
- `INDEX (city_id, status, published_at)`

**Scalability Notes**

- Feeds should page by indexed timestamps or cursor ids.
- Avoid putting comments in this table; add a dedicated comments table when needed.
- Counters can be denormalized later if read pressure rises.

### tracks

Audio works, mixes, sound pieces, releases, and externally linked tracks.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` |
| profile_id | BIGINT UNSIGNED | Yes | FK to publishing profile |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| audio_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| artwork_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| title | VARCHAR(180) | No | Track title |
| slug | VARCHAR(220) | Yes | Optional public slug |
| description | TEXT | Yes | Track notes |
| type | VARCHAR(40) | No | `track`, `mix`, `set`, `podcast`, `sound_art` |
| status | VARCHAR(40) | No | `draft`, `published`, `hidden`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| source_type | VARCHAR(40) | No | `upload`, `external` |
| external_url | VARCHAR(2048) | Yes | External playback link |
| duration_seconds | DECIMAL(10,3) | Yes | Cached duration |
| genre | VARCHAR(120) | Yes | V1 simple genre |
| credits | JSON | Yes | Flexible credits |
| published_at | TIMESTAMP | Yes | Publication time |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to user.
- Optionally belongs to collective, profile, city, and area.
- Belongs to optional audio and artwork media items.
- Can have moods, reactions, saves, and recommendation signals.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (user_id)`
- `INDEX (collective_id)`
- `INDEX (profile_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (published_at)`
- `INDEX (created_at)`
- `INDEX (city_id, status, published_at)`

**Scalability Notes**

- Play events should be tracked in a future high-volume table, not directly as rows here.
- Credits can start as JSON but should move to normalized credits if attribution becomes core.
- Audio transcodes and waveforms should be background generated through `media_items`.

### stories

Temporary visual/audio/text moments attached to users, collectives, events, cities, or areas.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` |
| event_id | BIGINT UNSIGNED | Yes | FK to `events.id` |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| type | VARCHAR(40) | No | `image`, `video`, `text`, `audio` |
| status | VARCHAR(40) | No | `active`, `expired`, `hidden`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| text | VARCHAR(1000) | Yes | Text story content |
| expires_at | TIMESTAMP | No | Expiration time |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to user.
- Optionally belongs to collective, event, city, area, and media item.
- Can receive reactions and recommendation signals.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (user_id)`
- `INDEX (collective_id)`
- `INDEX (event_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (expires_at)`
- `INDEX (created_at)`
- `INDEX (city_id, status, expires_at)`

**Scalability Notes**

- High-volume views should use a separate story views table when needed.
- Expired story cleanup can be queued while retaining private archives if product policy requires.

### countries

Top-level geography.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| iso2 | CHAR(2) | No | ISO country code |
| iso3 | CHAR(3) | Yes | ISO3 country code |
| name | VARCHAR(120) | No | Display name |
| slug | VARCHAR(140) | No | Unique slug |
| status | VARCHAR(40) | No | `active`, `hidden` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Has many cities, areas through cities, users, profiles, events, and venues.

**Indexes**

- `UNIQUE (iso2)`
- `UNIQUE (slug)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- Stable reference data; seed from a controlled source.
- Localization can be added with country translations later.

### cities

City-level discovery geography.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| country_id | BIGINT UNSIGNED | No | FK to `countries.id` |
| name | VARCHAR(140) | No | Display name |
| slug | VARCHAR(160) | No | City slug, unique per country |
| timezone | VARCHAR(80) | Yes | Local timezone |
| latitude | DECIMAL(10,7) | Yes | Optional coordinate |
| longitude | DECIMAL(10,7) | Yes | Optional coordinate |
| status | VARCHAR(40) | No | `active`, `hidden` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to country.
- Has many areas, venues, events, posts, tracks, stories, collaborations, collectives, and profiles.

**Indexes**

- `UNIQUE (country_id, slug)`
- `INDEX (country_id)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (latitude, longitude)`

**Scalability Notes**

- City feeds should rely on `city_id` indexes across content tables.
- Alias and multilingual names can be added later without changing core city references.

### areas

Districts, neighborhoods, scenes, or cultural zones within cities.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| city_id | BIGINT UNSIGNED | No | FK to `cities.id` |
| name | VARCHAR(140) | No | Display name |
| slug | VARCHAR(160) | No | Area slug, unique per city |
| type | VARCHAR(40) | No | `neighborhood`, `district`, `zone`, `scene` |
| latitude | DECIMAL(10,7) | Yes | Optional coordinate |
| longitude | DECIMAL(10,7) | Yes | Optional coordinate |
| status | VARCHAR(40) | No | `active`, `hidden` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to city.
- Has many venues, events, posts, tracks, stories, collaborations, collectives, and profiles.

**Indexes**

- `UNIQUE (city_id, slug)`
- `INDEX (city_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (latitude, longitude)`

**Scalability Notes**

- Areas should not require exact geofencing in V1.
- Future geographic polygons should live in a separate MySQL-compatible geometry or metadata table if needed.

### venues

Physical places that host events or represent cultural infrastructure.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| owner_user_id | BIGINT UNSIGNED | Yes | FK to `users.id` |
| profile_id | BIGINT UNSIGNED | Yes | FK to `profiles.id` |
| country_id | BIGINT UNSIGNED | No | FK to `countries.id` |
| city_id | BIGINT UNSIGNED | No | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| name | VARCHAR(180) | No | Venue name |
| slug | VARCHAR(220) | No | Unique per city |
| type | VARCHAR(60) | No | `venue`, `gallery`, `club`, `studio`, `public_space` |
| status | VARCHAR(40) | No | `active`, `hidden`, `closed` |
| address_line_1 | VARCHAR(255) | Yes | Address |
| address_line_2 | VARCHAR(255) | Yes | Address |
| postal_code | VARCHAR(40) | Yes | Postal code |
| latitude | DECIMAL(10,7) | Yes | Coordinate |
| longitude | DECIMAL(10,7) | Yes | Coordinate |
| website_url | VARCHAR(2048) | Yes | External URL |
| metadata | JSON | Yes | Accessibility, capacity, provider ids |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to optional owner user and profile.
- Belongs to country, city, and optional area.
- Has many events.

**Indexes**

- `UNIQUE (uuid)`
- `UNIQUE (city_id, slug)`
- `INDEX (owner_user_id)`
- `INDEX (profile_id)`
- `INDEX (country_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (latitude, longitude)`

**Scalability Notes**

- Venue ownership can become multi-user later through a venue members table.
- Coordinates are optional to avoid blocking cultural spaces that do not publish exact locations.

### events

Event hubs for cultural activity.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| organizer_user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` |
| venue_id | BIGINT UNSIGNED | Yes | FK to `venues.id` |
| country_id | BIGINT UNSIGNED | No | FK to `countries.id` |
| city_id | BIGINT UNSIGNED | No | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| title | VARCHAR(220) | No | Event name |
| slug | VARCHAR(260) | Yes | Optional public slug |
| description | TEXT | Yes | Event copy |
| type | VARCHAR(60) | No | `concert`, `exhibition`, `party`, `workshop`, `screening`, etc. |
| status | VARCHAR(40) | No | `draft`, `published`, `canceled`, `postponed`, `completed`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| starts_at | DATETIME | No | Local event start |
| ends_at | DATETIME | Yes | Local event end |
| timezone | VARCHAR(80) | No | Event timezone |
| cover_media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| ticket_url | VARCHAR(2048) | Yes | External ticket link |
| capacity | INT UNSIGNED | Yes | Optional venue/event capacity |
| latitude | DECIMAL(10,7) | Yes | Event-specific coordinate |
| longitude | DECIMAL(10,7) | Yes | Event-specific coordinate |
| metadata | JSON | Yes | Flexible future fields |
| published_at | TIMESTAMP | Yes | Publication time |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to organizer user.
- Optionally belongs to collective and venue.
- Belongs to country, city, and optional area.
- Has many attendees, lineups, media, posts, and stories.
- Can have moods, reactions, saves, and recommendation signals.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (organizer_user_id)`
- `INDEX (collective_id)`
- `INDEX (venue_id)`
- `INDEX (country_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (starts_at)`
- `INDEX (created_at)`
- `INDEX (city_id, status, starts_at)`
- `INDEX (latitude, longitude)`

**Scalability Notes**

- Event discovery will lean heavily on `(city_id, status, starts_at)`.
- Native ticketing should be added through separate ticketing/order tables later.
- Recurring events should be modeled separately later rather than overloading this table.

### event_attendees

RSVP, save-like attendance, and attendance lifecycle for events.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| event_id | BIGINT UNSIGNED | No | FK to `events.id` |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| status | VARCHAR(40) | No | `interested`, `going`, `attended`, `canceled` |
| source | VARCHAR(40) | Yes | `organic`, `invite`, `recommendation` |
| checked_in_at | TIMESTAMP | Yes | Future check-in |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to event.
- Belongs to user.

**Indexes**

- `UNIQUE (event_id, user_id)`
- `INDEX (event_id)`
- `INDEX (user_id)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- Can support RSVP analytics without native tickets.
- Check-in and ticket ownership should move to dedicated tables later.

### event_lineups

Artists, collectives, speakers, DJs, performers, and contributors attached to events.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| event_id | BIGINT UNSIGNED | No | FK to `events.id` |
| user_id | BIGINT UNSIGNED | Yes | FK to `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` |
| profile_id | BIGINT UNSIGNED | Yes | FK to `profiles.id` |
| name_override | VARCHAR(180) | Yes | External/unclaimed participant |
| role | VARCHAR(80) | Yes | `artist`, `dj`, `speaker`, `host`, `curator` |
| sort_order | INT UNSIGNED | No | Lineup order |
| status | VARCHAR(40) | No | `invited`, `confirmed`, `declined`, `hidden` |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to event.
- Optionally belongs to user, collective, or profile.

**Indexes**

- `INDEX (event_id)`
- `INDEX (user_id)`
- `INDEX (collective_id)`
- `INDEX (profile_id)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (event_id, sort_order)`

**Scalability Notes**

- Allows unclaimed lineup entries through `name_override`.
- Future invitations can move into a general invitations table.

### event_media

Ordered media attachments for event covers, galleries, recaps, and promotional material.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| event_id | BIGINT UNSIGNED | No | FK to `events.id` |
| media_item_id | BIGINT UNSIGNED | No | FK to `media_items.id` |
| type | VARCHAR(40) | No | `cover`, `gallery`, `recap`, `flyer` |
| status | VARCHAR(40) | No | `active`, `hidden`, `archived` |
| sort_order | INT UNSIGNED | No | Display order |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to event.
- Belongs to media item.

**Indexes**

- `UNIQUE (event_id, media_item_id, type)`
- `INDEX (event_id)`
- `INDEX (media_item_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (event_id, sort_order)`

**Scalability Notes**

- Keeps event galleries explicit even though `media_items` can also be polymorphic.
- Similar dedicated pivots can be added for posts or collectives if ordering and purpose become important.

### collaborations

Calls for collaborators, project opportunities, and creative needs.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| user_id | BIGINT UNSIGNED | No | FK to owner `users.id` |
| collective_id | BIGINT UNSIGNED | Yes | FK to `collectives.id` |
| event_id | BIGINT UNSIGNED | Yes | FK to `events.id` |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| title | VARCHAR(220) | No | Call title |
| description | TEXT | No | Call description |
| type | VARCHAR(60) | No | `project`, `event`, `commission`, `residency`, `crew`, `booking` |
| status | VARCHAR(40) | No | `draft`, `open`, `paused`, `filled`, `closed`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| remote_type | VARCHAR(40) | No | `local`, `remote`, `hybrid` |
| needed_roles | JSON | Yes | V1 flexible role list |
| deadline_at | TIMESTAMP | Yes | Application deadline |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to user.
- Optionally belongs to collective, event, city, and area.
- Has many collaboration applications.
- Can have moods, reactions, saves, and recommendation signals.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (user_id)`
- `INDEX (collective_id)`
- `INDEX (event_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (remote_type)`
- `INDEX (deadline_at)`
- `INDEX (created_at)`
- `INDEX (city_id, status, deadline_at)`

**Scalability Notes**

- `needed_roles` can be normalized later if role search becomes central.
- Application privacy should be enforced at policy level and with careful API scoping.

### collaboration_applications

Private responses to collaboration calls.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| collaboration_id | BIGINT UNSIGNED | No | FK to `collaborations.id` |
| user_id | BIGINT UNSIGNED | No | Applicant FK to `users.id` |
| conversation_id | BIGINT UNSIGNED | Yes | FK to `conversations.id` |
| status | VARCHAR(40) | No | `submitted`, `shortlisted`, `accepted`, `rejected`, `withdrawn` |
| message | TEXT | Yes | Applicant message |
| portfolio_url | VARCHAR(2048) | Yes | External work |
| metadata | JSON | Yes | Attachments/references |
| submitted_at | TIMESTAMP | No | Submission time |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to collaboration.
- Belongs to applicant user.
- Optionally belongs to conversation.

**Indexes**

- `UNIQUE (collaboration_id, user_id)`
- `INDEX (collaboration_id)`
- `INDEX (user_id)`
- `INDEX (conversation_id)`
- `INDEX (status)`
- `INDEX (submitted_at)`
- `INDEX (created_at)`

**Scalability Notes**

- Keep applications private by default.
- If attachments become common, add an application media pivot rather than storing file data in metadata.

### collectives

Groups, crews, labels, studios, publications, and cultural organizations.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| owner_user_id | BIGINT UNSIGNED | No | Initial owner FK to `users.id` |
| profile_id | BIGINT UNSIGNED | Yes | FK to `profiles.id` |
| country_id | BIGINT UNSIGNED | Yes | FK to `countries.id` |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| name | VARCHAR(180) | No | Collective name |
| slug | VARCHAR(220) | No | Unique public slug |
| type | VARCHAR(60) | No | `collective`, `label`, `crew`, `studio`, `publication`, `community` |
| status | VARCHAR(40) | No | `active`, `restricted`, `archived` |
| visibility | VARCHAR(40) | No | Public/private state |
| description | TEXT | Yes | Collective description |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to owner user.
- Optionally belongs to profile, country, city, and area.
- Has many collective members, posts, tracks, events, collaborations, and stories.

**Indexes**

- `UNIQUE (uuid)`
- `UNIQUE (slug)`
- `INDEX (owner_user_id)`
- `INDEX (profile_id)`
- `INDEX (country_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (visibility)`
- `INDEX (created_at)`

**Scalability Notes**

- `owner_user_id` is useful for V1 bootstrap, but authority should move to `collective_members` roles over time.
- Future monetization can attach billing and payout tables to collectives.

### collective_members

Membership and permissions within collectives.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| collective_id | BIGINT UNSIGNED | No | FK to `collectives.id` |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| role | VARCHAR(60) | No | `owner`, `admin`, `editor`, `member` |
| status | VARCHAR(40) | No | `invited`, `active`, `declined`, `removed` |
| permissions | JSON | Yes | Optional fine-grained overrides |
| invited_by_user_id | BIGINT UNSIGNED | Yes | FK to `users.id` |
| joined_at | TIMESTAMP | Yes | Membership activation |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to collective.
- Belongs to user.
- Optionally belongs to inviting user.

**Indexes**

- `UNIQUE (collective_id, user_id)`
- `INDEX (collective_id)`
- `INDEX (user_id)`
- `INDEX (invited_by_user_id)`
- `INDEX (role)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- Fine-grained permissions can be normalized later if role logic becomes complex.
- Invite expiration can be added with `expires_at`.

### conversations

Private messaging containers.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| type | VARCHAR(40) | No | `direct`, `group`, `collective`, `event`, `collaboration` |
| status | VARCHAR(40) | No | `active`, `archived`, `restricted` |
| subject | VARCHAR(180) | Yes | Optional group/event subject |
| related_type | VARCHAR(120) | Yes | Optional polymorphic context |
| related_id | BIGINT UNSIGNED | Yes | Optional polymorphic context id |
| last_message_id | BIGINT UNSIGNED | Yes | FK to `messages.id`, nullable circular ref |
| last_message_at | TIMESTAMP | Yes | Conversation sorting |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Has many participants and messages.
- Optionally belongs to related event, collaboration, collective, or story context through morph fields.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (related_type, related_id)`
- `INDEX (last_message_at)`
- `INDEX (created_at)`

**Scalability Notes**

- Direct conversations can be enforced by application logic or a future deterministic key.
- Group, event, and collective messaging can reuse this table later.

### conversation_participants

Users participating in conversations, with per-user state.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| conversation_id | BIGINT UNSIGNED | No | FK to `conversations.id` |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| role | VARCHAR(40) | No | `member`, `admin`, `owner` |
| status | VARCHAR(40) | No | `active`, `requested`, `left`, `blocked`, `muted` |
| last_read_message_id | BIGINT UNSIGNED | Yes | FK to `messages.id` |
| last_read_at | TIMESTAMP | Yes | Read state |
| muted_until | TIMESTAMP | Yes | Mute state |
| deleted_at | TIMESTAMP | Yes | Participant-level hide/delete |
| created_at | TIMESTAMP | No |  |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to conversation.
- Belongs to user.
- Optionally belongs to last read message.

**Indexes**

- `UNIQUE (conversation_id, user_id)`
- `INDEX (conversation_id)`
- `INDEX (user_id)`
- `INDEX (role)`
- `INDEX (status)`
- `INDEX (last_read_at)`
- `INDEX (created_at)`

**Scalability Notes**

- Participant-level soft delete lets one user hide a conversation without deleting messages globally.
- For very large conversations, add membership pagination and message partitioning strategies later.

### messages

Individual private messages.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| uuid | CHAR(36) | No | Public identifier, unique |
| conversation_id | BIGINT UNSIGNED | No | FK to `conversations.id` |
| user_id | BIGINT UNSIGNED | No | Sender FK to `users.id` |
| media_item_id | BIGINT UNSIGNED | Yes | FK to `media_items.id` |
| type | VARCHAR(40) | No | `text`, `media`, `system`, `story_reply`, `application` |
| status | VARCHAR(40) | No | `sent`, `hidden`, `deleted`, `flagged` |
| body | TEXT | Yes | Message body |
| metadata | JSON | Yes | References, link previews, system payload |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |
| deleted_at | TIMESTAMP | Yes | Soft delete |

**Relationships**

- Belongs to conversation.
- Belongs to sender user.
- Optionally belongs to media item.

**Indexes**

- `UNIQUE (uuid)`
- `INDEX (conversation_id)`
- `INDEX (user_id)`
- `INDEX (media_item_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`
- `INDEX (conversation_id, created_at)`

**Scalability Notes**

- Message reads should use cursor pagination by `(conversation_id, id)` or `(conversation_id, created_at)`.
- End-to-end encryption would require separate encrypted payload design later.

### reactions

Reusable reactions to posts, tracks, stories, events, messages, profiles, collectives, and future objects.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| reactionable_type | VARCHAR(120) | No | Polymorphic target |
| reactionable_id | BIGINT UNSIGNED | No | Polymorphic target id |
| type | VARCHAR(40) | No | `like`, `love`, `fire`, `respect`, etc. |
| status | VARCHAR(40) | No | `active`, `removed` |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to user.
- Morphs to reactionable content/entity.

**Indexes**

- `UNIQUE (user_id, reactionable_type, reactionable_id, type)`
- `INDEX (user_id)`
- `INDEX (reactionable_type, reactionable_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- For high read traffic, denormalize reaction counts onto target tables or a stats table.
- Keep reaction taxonomy small in V1 to avoid turning the product into reaction farming.

### saved_items

Reusable saves/bookmarks across content and entities.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| user_id | BIGINT UNSIGNED | No | FK to `users.id` |
| saveable_type | VARCHAR(120) | No | Polymorphic target |
| saveable_id | BIGINT UNSIGNED | No | Polymorphic target id |
| type | VARCHAR(40) | No | `save`, `bookmark`, `interested` |
| status | VARCHAR(40) | No | `active`, `removed` |
| collection_name | VARCHAR(120) | Yes | Future lightweight folders |
| created_at | TIMESTAMP | No | Indexed |
| updated_at | TIMESTAMP | No |  |

**Relationships**

- Belongs to user.
- Morphs to saved posts, tracks, events, collaborations, profiles, collectives, or venues.

**Indexes**

- `UNIQUE (user_id, saveable_type, saveable_id, type)`
- `INDEX (user_id)`
- `INDEX (saveable_type, saveable_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (created_at)`

**Scalability Notes**

- User libraries can grow from this table.
- If collections become first-class, add `save_collections` and replace `collection_name`.

### recommendation_signals

Event stream of user and system signals used for explainable V1 recommendations and future ranking.

**Fields**

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | No | Primary key |
| user_id | BIGINT UNSIGNED | Yes | FK to `users.id`; nullable for anonymous/system signals |
| signalable_type | VARCHAR(120) | Yes | Polymorphic target |
| signalable_id | BIGINT UNSIGNED | Yes | Polymorphic target id |
| city_id | BIGINT UNSIGNED | Yes | FK to `cities.id` |
| area_id | BIGINT UNSIGNED | Yes | FK to `areas.id` |
| type | VARCHAR(60) | No | `view`, `dismiss`, `save`, `follow`, `play`, `rsvp`, `hide`, `impression` |
| source | VARCHAR(60) | No | `feed`, `search`, `city`, `profile`, `event`, `onboarding`, `system` |
| status | VARCHAR(40) | No | `active`, `ignored`, `suppressed` |
| weight | DECIMAL(8,4) | Yes | Optional ranking weight |
| reason_code | VARCHAR(80) | Yes | Human-readable explanation key |
| metadata | JSON | Yes | Request id, rank, experiment, context |
| occurred_at | TIMESTAMP | No | Event time |
| created_at | TIMESTAMP | No | Insert time |

**Relationships**

- Optionally belongs to user.
- Optionally belongs to city and area.
- Optionally morphs to a content/entity target.

**Indexes**

- `INDEX (user_id)`
- `INDEX (signalable_type, signalable_id)`
- `INDEX (city_id)`
- `INDEX (area_id)`
- `INDEX (type)`
- `INDEX (status)`
- `INDEX (source)`
- `INDEX (occurred_at)`
- `INDEX (created_at)`
- `INDEX (user_id, type, occurred_at)`
- `INDEX (city_id, type, occurred_at)`

**Scalability Notes**

- This can become high volume quickly. Consider retention windows, rollups, and archival tables.
- Keep personally sensitive recommendation data minimal and explainable.
- Future ML pipelines can consume this table or a derived export without changing core content schemas.

## Foreign Key Strategy

Recommended `ON DELETE` behavior:

- User-owned creative content: usually `RESTRICT` or `CASCADE` only when product deletion policy is clear. Soft deletes should handle most V1 removal.
- Pivot tables such as `event_attendees`, `event_lineups`, `event_media`, `collective_members`, `conversation_participants`, `reactions`, and `saved_items`: `CASCADE` when the parent row is hard-deleted.
- Geographic references: `RESTRICT` for countries, cities, and areas to avoid orphaning discovery data.
- Optional media references: `SET NULL` where deleting a media item should not delete the parent object.
- Messaging: avoid hard deleting conversations and messages in normal product flows; use soft deletes and participant-level deletes.

## Suggested Shared Status Values

- Content status: `draft`, `published`, `hidden`, `archived`.
- Event status: `draft`, `published`, `canceled`, `postponed`, `completed`, `archived`.
- Membership status: `invited`, `active`, `declined`, `removed`.
- Processing status: `pending`, `processing`, `ready`, `failed`.
- Recommendation signal status: `active`, `ignored`, `suppressed`.

Status values should be validated in Laravel application code rather than enforced with MySQL `ENUM`.

## Laravel Model Notes

- Use `SoftDeletes` for users, profiles, media items, posts, tracks, stories, venues, events, collaborations, collectives, conversations, and messages.
- Use `morphTo`, `morphMany`, and `morphToMany` for profiles, media, moods, reactions, saves, and recommendation signals.
- Use policies for every write operation involving profiles, collectives, events, collaborations, media, and messages.
- Use queued jobs for media processing, recommendation rollups, notification fanout, and future AI enrichment.
- Prefer cursor pagination for feeds, messages, city discovery, and event listings.

## Future Tables Not Included in V1 List

These are intentionally out of the requested V1 table list but should be expected later:

- `comments`
- `follows`
- `blocks`
- `reports`
- `notifications`
- `story_views`
- `track_plays`
- `profile_links`
- `invitations`
- `tickets`
- `orders`
- `subscriptions`
- `payout_accounts`
- `analytics_rollups`
- `search_index_items`
