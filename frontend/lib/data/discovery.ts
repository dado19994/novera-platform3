import { apiClient } from "@/lib/api/client";
import type { CityId } from "@/lib/city-media";
import { CITY_MEDIA } from "@/lib/city-media";
import type { City, Collaboration, DiscoveryCityResponse, DiscoveryHomeResponse, Event, Track } from "@/lib/api/types";
import { MOCK_ECOSYSTEM } from "@/lib/mock-data";

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === "true";
const MOCK_TIMEZONES: Record<CityId, string | null> = {
  default: null,
  rome: "Europe/Rome",
  barcelona: "Europe/Madrid",
  berlin: "Europe/Berlin",
  copenhagen: "Europe/Copenhagen",
  bari: "Europe/Rome",
};

export async function getHomeDiscovery(): Promise<DiscoveryHomeResponse> {
  if (USE_REAL_API) {
    return apiClient.get<DiscoveryHomeResponse>("/discovery/home");
  }

  return createMockDiscovery("default");
}

export async function getCityDiscovery(citySlug: string): Promise<DiscoveryCityResponse> {
  if (USE_REAL_API) {
    return apiClient.get<DiscoveryCityResponse>(`/discovery/city/${encodeURIComponent(citySlug)}`);
  }

  return createMockDiscovery(toCityId(citySlug));
}

function createMockDiscovery(cityId: CityId): DiscoveryCityResponse {
  const ecosystem = MOCK_ECOSYSTEM[cityId];
  const city = mockCity(cityId);

  return {
    featured_events: ecosystem.tonight.map((moment, index) => mockEvent(moment.title, moment.kind, moment.time, city, index)),
    emerging_artists: [],
    open_collaborations: ecosystem.opportunities.map((opportunity, index) => mockCollaboration(opportunity.title, opportunity.need, city, index)),
    collectives_near_you: [],
    tracks_to_discover: [mockTrack(ecosystem.audio.title, ecosystem.audio.length, city)],
  };
}

function toCityId(citySlug: string): CityId {
  return citySlug in CITY_MEDIA ? (citySlug as CityId) : "default";
}

function mockCity(cityId: CityId): City {
  const media = CITY_MEDIA[cityId];

  return {
    id: cityId === "default" ? 0 : Object.keys(CITY_MEDIA).indexOf(cityId),
    name: media.city,
    slug: cityId,
    timezone: MOCK_TIMEZONES[cityId],
    country_id: 0,
  };
}

function mockEvent(title: string, type: string, startsAt: string, city: City, index: number): Event {
  return {
    id: index + 1,
    uuid: `mock-event-${city.slug}-${index + 1}`,
    title,
    slug: null,
    description: null,
    type,
    status: "published",
    visibility: "public",
    country_id: city.country_id,
    city_id: city.id,
    area_id: null,
    venue_id: null,
    collective_id: null,
    starts_at: startsAt,
    ends_at: null,
    timezone: city.timezone ?? "UTC",
    ticket_url: null,
    capacity: null,
    published_at: null,
    city,
  };
}

function mockCollaboration(title: string, description: string, city: City, index: number): Collaboration {
  return {
    id: index + 1,
    uuid: `mock-collaboration-${city.slug}-${index + 1}`,
    creator_id: 0,
    title,
    description,
    type: "open_call",
    country_id: city.country_id,
    city_id: city.id,
    area_id: null,
    collective_id: null,
    event_id: null,
    status: "open",
    visibility: "public",
    remote_type: "local",
    needed_roles: [description],
    deadline: null,
    city,
  };
}

function mockTrack(title: string, length: string, city: City): Track {
  return {
    id: 1,
    uuid: `mock-track-${city.slug}`,
    title,
    slug: null,
    type: "track",
    status: "published",
    visibility: "public",
    genre: null,
    duration: parseDuration(length),
    city_id: city.id,
    area_id: null,
    published_at: null,
  };
}

function parseDuration(length: string) {
  const [minutes, seconds] = length.split(":").map(Number);

  return minutes * 60 + seconds;
}
