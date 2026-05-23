export type EntityId = number;
export type Nullable<T> = T | null;

export interface Country {
  id: EntityId;
  iso2: string;
  iso3: Nullable<string>;
  name: string;
  slug: string;
}

export interface City {
  id: EntityId;
  name: string;
  slug: string;
  timezone: Nullable<string>;
  country_id: EntityId;
}

export interface CreativeIdentity {
  id: EntityId;
  name: string;
  slug: string;
  type: string;
  is_primary: boolean;
  availability_status: Nullable<string>;
}

export interface Mood {
  id: EntityId;
  name: string;
  slug: string;
  type: string;
}

export interface MediaItem {
  id: EntityId;
  uuid: string;
  type: string;
  disk: string;
  path: string;
  mime_type: string;
  size_bytes: number;
  duration_seconds: Nullable<number>;
  alt_text: Nullable<string>;
  processing_status: string;
}

export interface Profile {
  id: EntityId;
  uuid: string;
  handle: string;
  display_name: string;
  type: string;
  short_bio: Nullable<string>;
  tagline: Nullable<string>;
  city_id: Nullable<EntityId>;
  area_id: Nullable<EntityId>;
  country_id: Nullable<EntityId>;
  city?: Nullable<City>;
  country?: Nullable<Country>;
  moods?: Mood[];
  avatar?: Nullable<MediaItem>;
  cover?: Nullable<MediaItem>;
  visibility: string;
  status: string;
}

export interface UserSummary {
  id: EntityId;
  uuid: string;
  name: string;
  username: string;
  status: string;
  onboarding_status: string;
  onboarding_completed: boolean;
  home_country_id: Nullable<EntityId>;
  home_city_id: Nullable<EntityId>;
  home_area_id: Nullable<EntityId>;
  profile?: Nullable<Profile>;
  creative_identities?: CreativeIdentity[];
}

export interface Event {
  id: EntityId;
  uuid: string;
  title: string;
  slug: Nullable<string>;
  description: Nullable<string>;
  type: string;
  status: string;
  visibility: string;
  country_id: EntityId;
  city_id: EntityId;
  area_id: Nullable<EntityId>;
  venue_id: Nullable<EntityId>;
  collective_id: Nullable<EntityId>;
  starts_at: string;
  ends_at: Nullable<string>;
  timezone: string;
  ticket_url: Nullable<string>;
  capacity: Nullable<number>;
  published_at: Nullable<string>;
  organizer?: UserSummary;
  country?: Country;
  city?: City;
  collective?: Collective;
  cover_media?: Nullable<MediaItem>;
  mood_tags?: Mood[];
  media_preview?: MediaItem[];
}

export interface Collaboration {
  id: EntityId;
  uuid: string;
  creator_id: EntityId;
  title: string;
  description: string;
  type: string;
  country_id: Nullable<EntityId>;
  city_id: Nullable<EntityId>;
  area_id: Nullable<EntityId>;
  collective_id: Nullable<EntityId>;
  event_id: Nullable<EntityId>;
  status: string;
  visibility: string;
  remote_type: string;
  needed_roles: Nullable<string[]>;
  deadline: Nullable<string>;
  creator?: UserSummary;
  country?: Nullable<Country>;
  city?: Nullable<City>;
  collective?: Nullable<Collective>;
  event?: Nullable<Event>;
  applications_count?: number;
}

export interface Collective {
  id: EntityId;
  uuid: string;
  name: string;
  slug: string;
  manifesto: Nullable<string>;
  description: Nullable<string>;
  type: string;
  status: string;
  visibility: string;
  recruiting_status: string;
  country_id: Nullable<EntityId>;
  city_id: Nullable<EntityId>;
  area_id: Nullable<EntityId>;
  cover_media_id: Nullable<EntityId>;
  country?: Nullable<Country>;
  city?: Nullable<City>;
  cover_media?: Nullable<MediaItem>;
  owner?: UserSummary;
  profile?: Nullable<Profile>;
  members_count?: number;
}

export interface Track {
  id: EntityId;
  uuid: string;
  title: string;
  slug: Nullable<string>;
  type: string;
  status: string;
  visibility: string;
  genre: Nullable<string>;
  duration: Nullable<number>;
  city_id: Nullable<EntityId>;
  area_id: Nullable<EntityId>;
  published_at: Nullable<string>;
  audio?: Nullable<MediaItem>;
  artwork?: Nullable<MediaItem>;
  moods?: Mood[];
}

export interface DiscoveryArtist {
  score: number;
  user: UserSummary;
  profile: Profile;
  creative_identities: CreativeIdentity[];
  moods: Mood[];
  city: City;
}

export interface DiscoveryHomeResponse {
  featured_events: Event[];
  emerging_artists: DiscoveryArtist[];
  open_collaborations: Collaboration[];
  collectives_near_you: Collective[];
  tracks_to_discover: Track[];
}

// Laravel currently returns the same modular payload for city discovery,
// scoped using the route city before executing the home discovery query.
export type DiscoveryCityResponse = DiscoveryHomeResponse;
