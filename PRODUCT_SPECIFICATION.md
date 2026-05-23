# Novera Product Specification

## Product Summary

Novera is creative culture infrastructure for artists, musicians, makers, curators, collectives, venues, organizers, and culturally curious audiences. It is built with Laravel and MySQL, with a V1 focused on profiles, media, audio, events, collaborations, collectives, messaging, and geographic discovery.

Novera should feel like a cultural map and living archive, not a metrics casino. Content and artwork lead the experience. Discovery is hybrid: geographic, social, editorial, algorithmic, and intentional. AI may support ranking, moderation, recommendations, search, translation, enrichment, and summarization, but it should stay invisible unless a user explicitly invokes it.

## Product Principles

- Content and artwork first: the primary object is the creative artifact, not the reaction counter.
- Hybrid discovery, not toxic virality: combine freshness, geography, relationships, taste, editorial signals, and quality without optimizing purely for outrage or addictive loops.
- Invisible AI: AI should quietly improve relevance, safety, metadata, and operational scale without becoming the product's visible personality.
- Events as social ecosystems: events are not just calendar entries; they connect artists, venues, audiences, posts, stories, collectives, collaborations, and city scenes.
- Collectives as mini ecosystems: collectives can publish, host, recruit, message, showcase members, and create durable cultural identity.
- Geography as global/country/city/area: discovery should work from worldwide scenes down to neighborhoods, districts, venues, and cultural zones.
- Warm cinematic but simple UX: generous visuals, atmosphere, motion, and cultural context, balanced with fast navigation and clear actions.
- Monetization-ready architecture: V1 should support future subscriptions, ticketing, promoted placements, creator tools, marketplace features, and partner analytics without forcing monetization into launch.

## Technical Baseline

- Backend: Laravel.
- Database: MySQL.
- API style: JSON APIs for application clients, with clear resource boundaries.
- Auth: session and/or token-based access depending on web/mobile needs.
- Media: external object storage should be assumed for images, video, and audio, with MySQL storing metadata and references.
- Jobs: background queues should handle media processing, notifications, recommendations, indexing, and future AI enrichment.
- Authorization: policies should protect user-owned, collective-owned, event-owned, and collaboration-owned resources.
- Moderation: soft deletion, reporting, blocking, visibility states, and audit trails should be designed into core entities.

## Core Domain Concepts

- User: the account holder with authentication, settings, and security state.
- Creative identity: a user's cultural identity, role, discipline, style, and intent.
- Profile: the public-facing representation of a user, collective, venue, organizer, or project.
- Content: posts, media, tracks, stories, event updates, collaboration calls, and collective publications.
- Place: normalized geography from global to country to city to area, with optional venue and coordinate metadata.
- Relationship: follow, membership, attendance, collaboration, conversation, invitation, and recommendation signal.
- Visibility: public, unlisted, followers-only, collective-only, event-only, private, draft, archived.

## V1 Modules

### 1. Authentication

**Purpose**

Provide secure account creation, login, logout, password recovery, session management, and account ownership. Authentication is the trust foundation for all creative, social, and monetization features.

**Entities**

- User
- User credential
- Session or personal access token
- Email verification record
- Password reset token
- Device/session record
- Account status

**User Stories**

- As a new user, I can create an account with email and password.
- As a returning user, I can log in and securely access my account.
- As a user, I can verify my email before accessing sensitive or publishing features.
- As a user, I can reset my password.
- As a user, I can log out of my current session.
- As a platform operator, I can suspend or restrict accounts that violate policy.

**API Needs**

- Register user.
- Log in user.
- Log out user.
- Fetch authenticated user.
- Verify email.
- Resend verification email.
- Request password reset.
- Complete password reset.
- Update password.
- List and revoke sessions or tokens, if supported in V1.

**Database Considerations**

- Use Laravel's users table conventions where practical.
- Store email as unique and indexed.
- Store password hashes only, never plaintext credentials.
- Track email verification timestamp.
- Include account status fields such as active, restricted, suspended, deleted.
- Consider last login timestamps and basic security audit fields.
- Keep personally identifiable information minimal in V1.

**V1 Scope**

- Email/password authentication.
- Email verification.
- Password reset.
- Basic account status.
- Authenticated API access.

**Future Scope**

- Social login.
- Passkeys.
- Multi-factor authentication.
- Organization-managed accounts.
- Advanced session/device management.
- Risk-based login protection.

### 2. Onboarding

**Purpose**

Help users establish identity, intent, location, disciplines, taste, and initial discovery signals without making the first session feel bureaucratic.

**Entities**

- Onboarding state
- Interest
- Discipline
- Creative role
- Location preference
- Discovery preference
- Suggested follow target

**User Stories**

- As a new user, I can select what kind of creative or cultural participant I am.
- As a new user, I can choose disciplines, scenes, and formats I care about.
- As a new user, I can set my city or area for local discovery.
- As a new user, I can create a basic creative identity.
- As a new user, I can skip nonessential onboarding steps and complete them later.
- As Novera, the system can use onboarding answers to shape the first feed and recommendations.

**API Needs**

- Fetch onboarding configuration.
- Save onboarding step progress.
- Complete onboarding.
- Update selected roles, interests, disciplines, and location.
- Fetch suggested users, collectives, events, and posts.

**Database Considerations**

- Store onboarding completion state separately from the user record.
- Use normalized tables for interests, roles, disciplines, and locations.
- Use pivot tables for many-to-many selections.
- Track skipped steps so the product can prompt gently later.
- Preserve enough timestamps to understand onboarding conversion.

**V1 Scope**

- Role selection.
- Discipline and interest selection.
- City/area selection.
- Basic profile and creative identity prompts.
- Initial suggested follows and content.

**Future Scope**

- Adaptive onboarding by user type.
- Import from external creative platforms.
- AI-assisted profile drafting.
- Taste calibration through media selection.
- Team or collective onboarding.

### 3. Creative Identities

**Purpose**

Represent the many ways a person participates in culture: artist, musician, DJ, photographer, designer, filmmaker, curator, organizer, venue operator, writer, dancer, producer, builder, fan, patron, or hybrid role.

**Entities**

- Creative identity
- Role
- Discipline
- Skill
- Style tag
- Intent
- Availability status
- Identity verification marker, future-facing

**User Stories**

- As a user, I can define one or more creative identities.
- As a multidisciplinary creator, I can represent multiple roles without flattening myself into one label.
- As a collaborator, I can signal whether I am open to projects, bookings, events, commissions, or collective membership.
- As a viewer, I can quickly understand what someone creates, supports, or organizes.
- As the platform, Novera can use identities to improve discovery and matching.

**API Needs**

- Create, update, list, and delete creative identities.
- Attach roles, disciplines, skills, style tags, and intent.
- Set primary identity.
- Toggle availability and collaboration openness.
- Fetch identity detail for profile and discovery surfaces.

**Database Considerations**

- A user may have multiple creative identities.
- Roles, disciplines, skills, and style tags should be normalized or semi-normalized depending on moderation needs.
- Use slugs for shareable identity URLs if identities become independently addressable.
- Store availability and intent as queryable fields.
- Keep free-form bio fields separate from structured discovery fields.

**V1 Scope**

- One or more identities per user.
- Primary identity selection.
- Roles, disciplines, tags, and short bio.
- Availability flags for collaboration, bookings, and projects.

**Future Scope**

- Verified credits.
- Portfolio sections per identity.
- Identity-specific analytics.
- Public identity pages separate from account profiles.
- Professional credentials and reputation signals.

### 4. Profiles

**Purpose**

Provide public cultural homepages for people, collectives, venues, organizers, and projects. Profiles should showcase artwork, context, activity, location, links, and relationships.

**Entities**

- Profile
- Profile owner
- Profile link
- Profile section
- Featured media
- Featured track
- Featured event
- Follow relationship
- Block relationship

**User Stories**

- As a user, I can create and edit my public profile.
- As a creator, I can feature posts, tracks, events, and links.
- As a visitor, I can understand someone's creative world quickly.
- As a user, I can follow or unfollow profiles.
- As a user, I can block profiles I do not want to interact with.
- As a collective or venue, I can have a profile that is not tied visually to one individual.

**API Needs**

- Fetch public profile by handle.
- Fetch own editable profile.
- Update profile fields.
- Upload or attach avatar and cover media.
- Manage profile links.
- Manage featured content.
- Follow and unfollow profile.
- Block and unblock profile.

**Database Considerations**

- Handles should be unique and indexed.
- Profiles should support polymorphic ownership or a clear owner type.
- Avatar and cover media should reference media assets, not store binary data.
- Follow and block relationships need compound indexes.
- Public counters may be cached but should not drive the UX too aggressively.
- Include visibility and moderation state.

**V1 Scope**

- Public user profiles.
- Basic collective, event organizer, and venue-ready profile model.
- Avatar, cover, bio, location, links, and featured content.
- Follow and block.

**Future Scope**

- Profile themes.
- Professional pages for venues and organizations.
- External portfolio imports.
- Verified profiles.
- Paid profile enhancements.
- Profile analytics.

### 5. Media Posts

**Purpose**

Allow users and collectives to publish visual and text-based cultural artifacts: images, video clips, captions, process notes, announcements, event moments, releases, essays, and scene updates.

**Entities**

- Post
- Media asset
- Media attachment
- Caption
- Tag
- Mention
- Reaction
- Comment
- Save/bookmark
- Report

**User Stories**

- As a creator, I can publish a media-first post.
- As a viewer, I can browse posts with artwork prominent and interface chrome restrained.
- As a user, I can react, comment, save, and share posts.
- As a creator, I can tag collaborators, events, places, tracks, and collectives.
- As a user, I can report inappropriate content.
- As Novera, the system can rank content without relying only on raw engagement.

**API Needs**

- Create, update, delete, and fetch posts.
- Upload or attach media assets.
- Fetch feeds by following, city, area, tag, profile, event, or collective.
- React to posts.
- Comment on posts.
- Save and unsave posts.
- Report posts.
- Manage mentions and tags.

**Database Considerations**

- Separate post records from media asset records.
- Support multiple media attachments per post.
- Store media type, dimensions, duration, processing status, storage path, thumbnail path, and alt text.
- Index post owner, visibility, location, created_at, and moderation status.
- Comments and reactions should be queryable but can be summarized in counters.
- Use soft deletes for user recovery and moderation audit.

**V1 Scope**

- Image, video, and text/caption posts.
- Multi-asset posts.
- Tags, mentions, location, and event/collective attachment.
- Reactions, comments, saves, reports.
- Basic feeds.

**Future Scope**

- Long-form publishing.
- Collaborative posts.
- Remix/response formats.
- Paid or subscriber-only posts.
- Advanced media processing.
- AI-assisted alt text and metadata.

### 6. Tracks and Audio

**Purpose**

Support musicians, DJs, producers, sound artists, podcasters, and event organizers through uploadable or linkable audio objects that can be discovered, featured, attached to profiles, posts, events, and collectives.

**Entities**

- Track
- Audio asset
- Release
- Artist credit
- Genre
- Mood
- Playlist, future-facing
- Play event
- Save/bookmark

**User Stories**

- As an artist, I can upload or link a track.
- As a listener, I can play tracks from profiles, posts, events, and discovery surfaces.
- As a creator, I can add credits, genre, mood, artwork, and location.
- As an event organizer, I can attach tracks to an event lineup or announcement.
- As Novera, the system can use listening behavior as a gentle recommendation signal.

**API Needs**

- Create, update, delete, and fetch tracks.
- Upload or attach audio file.
- Attach artwork.
- Stream or provide playback URL.
- Track play events.
- Save and unsave tracks.
- Fetch tracks by profile, city, genre, event, collective, or recommendation context.

**Database Considerations**

- Keep audio metadata separate from storage files.
- Store duration, waveform path if generated, bitrate, processing status, and playback availability.
- Track credits should support multiple contributors and roles.
- Use indexed genre, mood, owner, location, and visibility fields.
- Play events may grow quickly and should be separated from core track rows.

**V1 Scope**

- Upload or external link support.
- Track detail pages or API resources.
- Artwork, credits, genre, mood, location.
- Basic playback metadata and play tracking.
- Profile, post, event, and collective attachment.

**Future Scope**

- Playlists.
- Albums and releases.
- Rights and licensing metadata.
- Ticket/music bundles.
- Paid downloads or subscriptions.
- Audio fingerprinting and advanced recommendations.

### 7. Stories

**Purpose**

Provide temporary, lightweight cultural updates for process, event nights, behind-the-scenes moments, announcements, and ephemeral city activity.

**Entities**

- Story
- Story media
- Story frame
- Story view
- Story reaction
- Story reply
- Expiration state

**User Stories**

- As a user, I can publish a temporary story.
- As an event attendee, I can share moments connected to an event.
- As a viewer, I can watch stories from people, collectives, events, and cities I follow.
- As a creator, I can see basic views and replies.
- As a user, I can reply to a story in a private conversation.

**API Needs**

- Create and delete stories.
- Upload story media.
- Fetch story trays by following, city, event, or collective.
- Mark story viewed.
- React or reply to a story.
- Attach story to event, place, or collective.

**Database Considerations**

- Store expiration timestamp and visibility.
- Story views can be high-volume and should be indexed carefully.
- Media assets should reuse the shared media system.
- Attachments to events, collectives, and places should be explicit.
- Expired stories can remain archived privately or be hard-deleted depending on policy.

**V1 Scope**

- Image and video stories.
- Expiration.
- Following and event story trays.
- Views, replies, basic reactions.

**Future Scope**

- Story highlights.
- Collaborative event stories.
- City story channels.
- Sponsor/event partner story placements.
- AI-assisted moderation for temporary media.

### 8. Events

**Purpose**

Make events central social ecosystems, connecting artists, venues, collectives, attendees, media, stories, posts, tracks, lineups, ticket links, and city discovery.

**Entities**

- Event
- Venue
- Event organizer
- Lineup item
- RSVP/attendance
- Ticket link
- Event post
- Event story
- Event role
- Event invitation

**User Stories**

- As an organizer, I can create and publish an event.
- As a venue, I can host events and display them on my profile.
- As an artist, I can be added to an event lineup.
- As a user, I can discover events in my city or area.
- As an attendee, I can RSVP, save, or share an event.
- As a creator, I can attach posts, stories, and tracks to an event.
- As Novera, the system can surface events as cultural hubs before, during, and after they happen.

**API Needs**

- Create, update, delete, and fetch events.
- Manage venue and location data.
- Manage lineup and participants.
- RSVP, save, and attendance status.
- Fetch events by city, area, date, discipline, collective, venue, or recommendation context.
- Attach posts, stories, tracks, and collaborators.
- Manage ticket links and external purchase URLs.

**Database Considerations**

- Events need start/end timestamps, timezone, location hierarchy, and visibility.
- Store venue either as a profile/entity or event-specific location.
- Lineup should support ordered participants and roles.
- RSVP status should be indexed by user and event.
- Date and geographic indexes are important for discovery.
- Events should support lifecycle states: draft, published, canceled, postponed, completed, archived.

**V1 Scope**

- Event creation and editing.
- Venue/location, time, description, cover media.
- Lineup and organizer association.
- RSVP/save.
- Event discovery by city/date.
- Event attachment for posts, stories, tracks, and collectives.

**Future Scope**

- Native ticketing.
- Check-in.
- Event analytics.
- Event chat.
- Paid promotion.
- Partner dashboards.
- Post-event galleries and archives.

### 9. Collaborations

**Purpose**

Help creators find each other for projects, events, releases, commissions, residencies, productions, crews, and cultural initiatives without turning matching into a shallow popularity contest.

**Entities**

- Collaboration post
- Collaboration role needed
- Application/response
- Invitation
- Collaboration status
- Skill requirement
- Location requirement
- Deadline

**User Stories**

- As a creator, I can publish a call for collaborators.
- As a user, I can browse opportunities by discipline, location, deadline, and intent.
- As a collaborator, I can respond privately with context and relevant work.
- As a project owner, I can accept, reject, or archive responses.
- As a collective, I can post collaboration opportunities from the collective identity.

**API Needs**

- Create, update, delete, and fetch collaboration calls.
- Search/filter calls by role, discipline, city, area, remote, deadline, status.
- Submit response or application.
- Invite a user to collaborate.
- Update collaboration status.
- Attach media, tracks, events, or collective context.

**Database Considerations**

- Calls should support ownership by user or collective.
- Requirements should be structured enough for filtering.
- Responses should be private by default.
- Track status lifecycle: draft, open, paused, filled, closed, archived.
- Location can be local, hybrid, remote, or event-specific.
- Consider anti-spam and rate limits.

**V1 Scope**

- Public collaboration calls.
- Role and discipline filters.
- Location and remote flags.
- Private responses.
- Status management.
- Collective-owned calls.

**Future Scope**

- Matching recommendations.
- Reputation and completed collaboration history.
- Contracting and payment workflows.
- Private curated opportunities.
- Residency and grant formats.

### 10. Collectives

**Purpose**

Represent groups, crews, labels, studios, venues, scenes, publications, communities, and cultural organizations as mini ecosystems with members, content, events, collaborations, and shared identity.

**Entities**

- Collective
- Collective profile
- Membership
- Member role
- Invitation
- Collective post
- Collective event
- Collective collaboration
- Collective settings

**User Stories**

- As a user, I can create a collective.
- As a collective admin, I can invite and manage members.
- As a member, I can publish or contribute under a collective identity if permitted.
- As a visitor, I can explore a collective's members, events, posts, tracks, and collaborations.
- As a collective, we can build a durable cultural presence around our work.

**API Needs**

- Create, update, delete, and fetch collectives.
- Manage collective profile.
- Invite, accept, remove, and update members.
- Assign member roles and permissions.
- Fetch collective posts, tracks, events, and collaborations.
- Follow or save collectives.

**Database Considerations**

- Membership needs role-based permissions.
- Collective ownership should not depend on a single user long term.
- Collective content should retain clear authorship and publishing identity.
- Invitations should expire and be auditable.
- Slugs should be unique and indexed.
- Permission policies must account for admin, editor, member, and viewer roles.

**V1 Scope**

- Collective creation.
- Public collective profiles.
- Member invitations and roles.
- Collective-owned posts, events, and collaboration calls.
- Follow/save collective.

**Future Scope**

- Collective subscriptions.
- Shared revenue and payouts.
- Internal collective chat.
- Resource libraries.
- Collective analytics.
- Sponsorship and partner pages.

### 11. Messaging

**Purpose**

Enable private communication for collaboration, event coordination, story replies, collective operations, and user-to-user relationships while protecting users from spam and abuse.

**Entities**

- Conversation
- Conversation participant
- Message
- Message attachment
- Message read receipt
- Message request
- Block/mute state

**User Stories**

- As a user, I can send and receive direct messages.
- As a user, I can reply to a story privately.
- As a collaborator, I can continue a conversation from a collaboration response.
- As a collective member, I can receive messages related to collective activity if permitted.
- As a user, I can block, mute, or report unwanted conversations.

**API Needs**

- Create or fetch conversation.
- Send message.
- Fetch conversation list.
- Fetch message history.
- Mark messages as read.
- Attach media or references.
- Mute, block, report, or leave conversation.
- Handle message requests from non-followed users.

**Database Considerations**

- Separate conversations, participants, and messages.
- Index conversations by participant and updated_at.
- Messages need sender, body, attachments, read state, and moderation state.
- Message requests may require a separate status field.
- Soft delete from a participant's view without deleting for everyone.
- Consider future encryption requirements, though V1 may not support end-to-end encryption.

**V1 Scope**

- One-to-one messaging.
- Message requests.
- Story replies.
- Collaboration response conversations.
- Read state, mute, block, report.

**Future Scope**

- Group messaging.
- Collective internal channels.
- Event chats.
- Rich media and voice notes.
- End-to-end encryption evaluation.
- Automated safety filtering.

### 12. City-Based Geographic Discovery

**Purpose**

Make place a first-class discovery layer. Novera should help users understand what is happening globally, by country, by city, and by area, while giving local scenes room to breathe.

**Entities**

- Country
- City
- Area
- Venue/place
- Geo coordinate
- Location alias
- Discovery surface
- Local trend signal

**User Stories**

- As a user, I can set my home city and areas of interest.
- As a traveler, I can explore another city's creative scene.
- As a local, I can discover nearby events, posts, collectives, tracks, and collaborators.
- As a creator, I can tag content to a city or area.
- As Novera, the system can balance local relevance with global discovery.

**API Needs**

- Fetch countries, cities, and areas.
- Search places and locations.
- Set user home location and discovery locations.
- Fetch city/area feeds.
- Fetch city events, collectives, profiles, posts, tracks, and collaborations.
- Attach location to content.

**Database Considerations**

- Normalize global/country/city/area hierarchy.
- Store slugs and display names for each geographic level.
- Support optional latitude/longitude for distance queries.
- Index city_id, area_id, country_id, and coordinates where used.
- Location aliases help handle local names, abbreviations, and multilingual naming.
- Avoid requiring exact coordinates for all cultural content.

**V1 Scope**

- Country, city, and area tables.
- User home city and areas of interest.
- Content and event location tagging.
- City and area discovery feeds.
- Basic search for locations.

**Future Scope**

- Neighborhood heatmaps.
- Venue intelligence.
- Travel mode.
- Local editorial guides.
- City ambassadors.
- Geo-aware notifications.

### 13. Recommendation Placeholders

**Purpose**

Reserve architecture for recommendation systems without overfitting V1 to an opaque algorithm. V1 should support simple, explainable ranking and collect the signals needed for future personalization.

**Entities**

- Recommendation candidate
- Recommendation reason
- User preference signal
- Interaction signal
- Content quality signal
- Suppression rule
- Ranking context

**User Stories**

- As a user, I can receive relevant suggestions without feeling manipulated.
- As a user, I can understand why something is recommended at a basic level.
- As a user, I can hide content, profiles, or topics I do not want.
- As Novera, the system can improve recommendations over time using ethical, hybrid signals.
- As an operator, I can tune discovery to support healthy creative ecosystems.

**API Needs**

- Fetch recommended posts, profiles, tracks, events, collectives, and collaborations.
- Record lightweight interaction signals.
- Hide or dismiss recommendation.
- Fetch recommendation reasons.
- Support context-specific recommendations such as city, profile, event, post detail, or onboarding.

**Database Considerations**

- Store interaction events separately from core content rows.
- Maintain explicit user preferences and dismissals.
- Keep recommendation reason codes human-readable.
- Add fields needed for ranking context, such as source, score, reason, freshness, and location fit.
- Design for offline jobs that can precompute recommendations later.
- Include safeguards for blocks, mutes, reports, private content, and moderation state.

**V1 Scope**

- Placeholder recommendation endpoints.
- Rule-based recommendations using follows, location, interests, recency, and content type.
- Dismiss/hide feedback.
- Basic reason labels such as "in your city", "similar discipline", "from a collective you follow".

**Future Scope**

- Machine-learning ranking.
- Embedding-based similarity.
- Collaborative filtering.
- Editorial recommendation tools.
- User-controlled ranking modes.
- Safety, diversity, and freshness constraints.

## Cross-Cutting Requirements

### Visibility and Privacy

- Every publishable object should have a visibility state.
- Private and restricted objects must be excluded from discovery, recommendations, and public APIs.
- Blocks and mutes must affect feeds, messaging, recommendations, and profile visibility.
- Users should have clear controls over location visibility.

### Moderation and Trust

- Reports should support posts, profiles, messages, tracks, events, collaborations, stories, and collectives.
- Moderation state should be queryable and auditable.
- Soft deletion should be preferred for user-generated content in V1.
- Abuse controls should include blocking, muting, reporting, rate limiting, and account restriction.

### Media Handling

- Media files should be stored outside MySQL.
- MySQL should store metadata, ownership, visibility, processing status, and storage references.
- Background jobs should handle thumbnails, transcodes, waveform generation, duration extraction, and future AI enrichment.
- Failed media processing must be represented clearly.

### Notifications

- V1 should leave room for notification records even if delivery channels are minimal.
- Notification types should include follows, comments, messages, collaboration responses, event updates, collective invitations, and mentions.
- Future delivery channels may include email, push, digest, and in-app notifications.

### Search

- V1 search can begin with database-backed search across profiles, posts, tracks, events, collectives, collaborations, cities, and areas.
- Search should respect visibility, moderation, and blocking.
- Future search can add external indexing and semantic retrieval.

### Monetization Readiness

- Core objects should support future ownership, billing eligibility, payout linkage, subscription visibility, promoted placement, and ticketing integration.
- V1 should avoid hardcoding free-only assumptions into content, event, profile, collective, or messaging models.
- Monetization should enhance cultural infrastructure without making reach purely pay-to-play.

## V1 Product Boundaries

V1 should prioritize:

- Secure account foundation.
- Strong public profiles.
- Media-first posts.
- Audio-capable creative publishing.
- Event discovery and event-centered content.
- Collectives with members and publishing identity.
- Collaboration calls and private responses.
- One-to-one messaging.
- City and area-based discovery.
- Recommendation placeholders with simple explainable rules.

V1 should avoid:

- Native payments.
- Native ticketing.
- Complex creator subscriptions.
- Heavy algorithmic ranking.
- Public follower-count obsession.
- Advanced AI-facing user features.
- Full marketplace mechanics.
- Complex multi-organization administration.

## Suggested Implementation Phases

### Phase 1: Foundation

- Authentication.
- Profiles.
- Creative identities.
- Geography.
- Shared media asset model.
- Visibility, moderation state, and basic reporting.

### Phase 2: Publishing and Discovery

- Media posts.
- Tracks/audio.
- Feeds.
- City and area discovery.
- Follows, saves, comments, reactions.

### Phase 3: Culture Graph

- Events.
- Collectives.
- Collaborations.
- Event and collective attachments across posts, tracks, and stories.

### Phase 4: Communication and Intelligence

- Messaging.
- Stories.
- Notification records.
- Recommendation placeholders.
- Background ranking jobs.

### Phase 5: Monetization-Ready Extensions

- Ticketing integration points.
- Promoted placement fields and policies.
- Subscription-ready visibility.
- Partner and creator analytics foundations.

## Success Criteria for V1

- A creator can join, define their identity, publish work, and be discovered by role, discipline, city, and area.
- A listener or viewer can explore a city's creative scene through posts, tracks, events, collectives, and profiles.
- An organizer can publish an event, attach a lineup, and gather related cultural activity around it.
- A collective can present itself, manage members, publish, and host activity.
- A collaborator can find opportunities and respond privately.
- The product can collect recommendation signals without making algorithmic virality the core experience.
- The architecture can support future AI, payments, ticketing, subscriptions, and analytics without major domain rewrites.
