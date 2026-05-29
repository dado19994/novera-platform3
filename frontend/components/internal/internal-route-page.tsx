import { CityMediaProvider } from "@/components/city-media/city-media-provider";
import { AppShell } from "@/components/layout/app-shell";
import { CreativeMapFull } from "@/components/map/CreativeMapFull";
import { CITY_MEDIA } from "@/lib/city-media";
import { MOCK_ACTIVITY_FEED, MOCK_ECOSYSTEM } from "@/lib/mock-data";
import type { ReactNode } from "react";

type InternalPageKind =
  | "explore"
  | "artists"
  | "events"
  | "creative-map"
  | "live-rooms"
  | "spaces"
  | "collectives"
  | "open-calls"
  | "ai-match"
  | "activity";

type Tone = "artists" | "events" | "collectives" | "audio" | "spaces" | "match" | "opportunities" | "neutral";

interface PageConfig {
  kind: InternalPageKind;
  eyebrow: string;
  title: string;
  description: string;
  tone: Tone;
}

const PAGE_CONFIG: Record<InternalPageKind, PageConfig> = {
  explore: {
    kind: "explore",
    eyebrow: "Discovery",
    title: "Explore the ecosystem",
    description: "Search scenes, people, rooms and opportunities moving through Rome tonight.",
    tone: "events",
  },
  artists: {
    kind: "artists",
    eyebrow: "Directory",
    title: "Artists active now",
    description: "Find creators by discipline, city, availability and collaboration signal.",
    tone: "artists",
  },
  events: {
    kind: "events",
    eyebrow: "Cultural movement",
    title: "Events starting soon",
    description: "Live rooms, screenings, concerts and gatherings across the city layer.",
    tone: "events",
  },
  "creative-map": {
    kind: "creative-map",
    eyebrow: "Live ecosystem",
    title: "Creative Map",
    description: "The expanded cultural network: districts, routes, signals and active rooms.",
    tone: "events",
  },
  "live-rooms": {
    kind: "live-rooms",
    eyebrow: "Audio / social",
    title: "Live rooms",
    description: "Join conversations, listening sessions and spatial broadcasts happening now.",
    tone: "audio",
  },
  spaces: {
    kind: "spaces",
    eyebrow: "Places",
    title: "Creative spaces",
    description: "Studios, galleries, residencies and rooms with availability across the city.",
    tone: "spaces",
  },
  collectives: {
    kind: "collectives",
    eyebrow: "Community",
    title: "Collectives recruiting",
    description: "Groups forming around sound, image, performance, publishing and night culture.",
    tone: "collectives",
  },
  "open-calls": {
    kind: "open-calls",
    eyebrow: "Opportunities",
    title: "Open calls",
    description: "Paid briefs, residencies, collaborations and urgent roles matched to your profile.",
    tone: "opportunities",
  },
  "ai-match": {
    kind: "ai-match",
    eyebrow: "Personal system",
    title: "AI Match",
    description: "Useful recommendations shaped by your practice, scene activity and live opportunities.",
    tone: "match",
  },
  activity: {
    kind: "activity",
    eyebrow: "Live feed",
    title: "Activity",
    description: "A persistent feed of collaborations, sessions, joins and system signals.",
    tone: "neutral",
  },
};

const toneLabel: Record<Tone, string> = {
  artists: "Artists",
  events: "Events",
  collectives: "Collectives",
  audio: "Audio",
  spaces: "Spaces",
  match: "AI Match",
  opportunities: "Open Calls",
  neutral: "Novera",
};

const categories = [
  { label: "Artists", detail: "2.1k active", tone: "artists" as Tone },
  { label: "Events", detail: "96 today", tone: "events" as Tone },
  { label: "Music", detail: "784 rooms", tone: "audio" as Tone },
  { label: "Visual", detail: "1.2k works", tone: "artists" as Tone },
  { label: "Spaces", detail: "432 places", tone: "spaces" as Tone },
  { label: "AI Match", detail: "3 matches", tone: "match" as Tone },
  { label: "Open Calls", detail: "18 open", tone: "opportunities" as Tone },
];

const artists = [
  { name: "Elena Martinelli", role: "Visual Artist", city: "Rome", match: "92% match", status: "Available", tone: "artists" as Tone },
  { name: "Alba Forma", role: "Sound Artist", city: "Ostiense", match: "Live now", status: "Listening room", tone: "audio" as Tone },
  { name: "Neri Luce", role: "Moving Image", city: "Pigneto", match: "Rising", status: "Open to collab", tone: "artists" as Tone },
  { name: "Riva Ensemble", role: "Performance", city: "Trastevere", match: "84% fit", status: "Recruiting", tone: "collectives" as Tone },
  { name: "Cava Studio", role: "Projection / DMX", city: "San Lorenzo", match: "Needs artist", status: "Open call", tone: "opportunities" as Tone },
  { name: "Forma Roma", role: "Field Recording", city: "Rome", match: "Nearby", status: "Tonight", tone: "audio" as Tone },
];

const spaces = [
  { title: "Forma Cinema", type: "Screening room", city: "Ostiense", status: "Available tonight", tone: "spaces" as Tone },
  { title: "Cava Studio", type: "Projection studio", city: "San Lorenzo", status: "Open call", tone: "opportunities" as Tone },
  { title: "Pigneto Archive", type: "Gallery / archive", city: "Pigneto", status: "Viewing slots", tone: "spaces" as Tone },
  { title: "Trastevere Room", type: "Community space", city: "Trastevere", status: "Live session", tone: "audio" as Tone },
];

const collectives = [
  { title: "Echoes Of Now", city: "Colli", discipline: "Audio / visual", members: "18 members", status: "Recruiting", tone: "collectives" as Tone },
  { title: "Afterlight Studies", city: "Pigneto", discipline: "16mm / image", members: "7 members", status: "Active this week", tone: "artists" as Tone },
  { title: "Courtyard Resonance", city: "San Lorenzo", discipline: "Live sound", members: "12 members", status: "Join room", tone: "audio" as Tone },
  { title: "Stone Index", city: "Ostiense", discipline: "Archive / edition", members: "9 members", status: "Looking for editor", tone: "opportunities" as Tone },
];

const openCalls = [
  { title: "Light artist for live score", organizer: "Cava Studio", need: "Projection / DMX", deadline: "Closes Sun", reward: "Paid", tone: "opportunities" as Tone },
  { title: "Field recordings archive", organizer: "Forma Roma", need: "Sound artists", deadline: "5 places", reward: "Residency", tone: "audio" as Tone },
  { title: "Brand identity for collective", organizer: "Echoes Of Now", need: "Visual strategy", deadline: "New", reward: "Budget 1.8k", tone: "collectives" as Tone },
  { title: "Moving image installation", organizer: "Afterlight", need: "Editor / color", deadline: "48 hours", reward: "Paid", tone: "artists" as Tone },
];

export function InternalRoutePage({ kind }: { kind: InternalPageKind }) {
  const config = PAGE_CONFIG[kind];

  return (
    <CityMediaProvider initialCity="rome">
      <AppShell>
        <InternalExperience config={config} />
      </AppShell>
    </CityMediaProvider>
  );
}

function InternalExperience({ config }: { config: PageConfig }) {
  const city = CITY_MEDIA.rome;
  const ecosystem = MOCK_ECOSYSTEM.rome;
  const activity = MOCK_ACTIVITY_FEED.rome;

  return (
    <main className={`internal-page internal-${config.kind}`} data-tone={config.tone}>
      <PageTopline />
      <PageHeader config={config} />
      {config.kind === "explore" && <ExplorePage cityImage={city.imageSrc} />}
      {config.kind === "artists" && <ArtistsPage />}
      {config.kind === "events" && <EventsPage cityImage={city.imageSrc} />}
      {config.kind === "creative-map" && <CreativeMapFull cityImage={city.imageSrc} ecosystem={ecosystem} />}
      {config.kind === "live-rooms" && <LiveRoomsPage cityImage={city.imageSrc} />}
      {config.kind === "spaces" && <SpacesPage />}
      {config.kind === "collectives" && <CollectivesPage />}
      {config.kind === "open-calls" && <OpenCallsPage />}
      {config.kind === "ai-match" && <AiMatchPage ecosystem={ecosystem} />}
      {config.kind === "activity" && <ActivityPage activities={activity} />}
    </main>
  );
}

function PageTopline() {
  return (
    <header className="internal-topline">
      <div>
        <p className="internal-brand">Novera</p>
        <p className="internal-context">Rome / live cultural operating system</p>
      </div>
      <div className="internal-tools">
        <button type="button">Scenes</button>
        <button type="button">Open calls</button>
        <button type="button" className="internal-utility-action">Share work</button>
      </div>
    </header>
  );
}

function PageHeader({ config }: { config: PageConfig }) {
  return (
    <section className="internal-hero">
      <div>
        <p className="internal-eyebrow">{config.eyebrow} / {toneLabel[config.tone]}</p>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </div>
      {config.kind !== "creative-map" && (
        <div className="internal-hero-actions">
          <SearchBox />
        </div>
      )}
    </section>
  );
}

function SearchBox() {
  return (
    <label className="internal-search">
      <span aria-hidden="true" />
      <input type="search" placeholder="Search artists, events, spaces..." />
      <button type="button">Filter</button>
    </label>
  );
}

function FilterPills({ items }: { items: string[] }) {
  return (
    <div className="internal-filters">
      {items.map((item, index) => (
        <button key={item} className={index === 0 ? "is-active" : ""} type="button">
          {item}
        </button>
      ))}
    </div>
  );
}

function CategoryRail() {
  return (
    <section className="category-rail" aria-label="Categories">
      {categories.map((category) => (
        <button key={category.label} className="category-tile" data-tone={category.tone} type="button">
          <span className="category-glyph nav-glyph" />
          <strong>{category.label}</strong>
          <small>{category.detail}</small>
        </button>
      ))}
    </section>
  );
}

function ExplorePage({ cityImage }: { cityImage: string }) {
  const ecosystem = MOCK_ECOSYSTEM.rome;

  return (
    <>
      <CategoryRail />
      <section className="internal-feature-grid">
        <FeaturedScene image={cityImage} />
        <CompactSignal title="Suggested for you" action="Review matches" items={ecosystem.matchedSignals.map((signal) => `${signal.label} / ${signal.confidence}`)} tone="match" />
      </section>
      <SectionShell title="Featured this week" action="View all">
        <CardGrid>
          {ecosystem.tonight.concat(ecosystem.tonight.slice(0, 2)).map((moment, index) => (
            <MediaCard
              key={`${moment.title}-${index}`}
              image={cityImage}
              title={moment.title}
              meta={moment.place}
              detail={moment.kind}
              badge={moment.format}
              action={moment.audio ? "Enter room" : "View"}
              tone={moment.audio ? "audio" : "events"}
            />
          ))}
        </CardGrid>
      </SectionShell>
      <SectionShell title="Trending now" action="Open feed">
        <DenseList items={["Afterlight Studies is rising in Pigneto", "Cava Studio posted a projection call", "Alba Forma opened a listening session", "Riva Ensemble joined the Rome scene"]} />
      </SectionShell>
    </>
  );
}

function ArtistsPage() {
  return (
    <>
      <FilterPills items={["All", "Visual", "Sound", "Available", "Collaborating", "Rome"]} />
      <SectionShell title="Rising in your scene" action="View all">
        <PersonGrid />
      </SectionShell>
      <SectionShell title="Available for collaboration" action="Connect">
        <CompactRows items={artists.slice(2)} action="Connect" />
      </SectionShell>
    </>
  );
}

function EventsPage({ cityImage }: { cityImage: string }) {
  const ecosystem = MOCK_ECOSYSTEM.rome;

  return (
    <>
      <FilterPills items={["All", "Concert", "Festival", "Exhibition", "Talk", "Online", "This week"]} />
      <section className="internal-feature-grid">
        <FeaturedScene image={cityImage} title="Ruins in Frequency" action="Join room" />
        <CompactSignal title="Starting soon" action="Calendar" items={["Courtyard Resonance / 23:15", "Afterlight Studies / 22:00", "Forma Roma / 21:40"]} tone="events" />
      </section>
      <SectionShell title="Near your city" action="Save all">
        <CardGrid>
          {ecosystem.tonight.map((moment) => (
            <MediaCard key={moment.title} image={cityImage} title={moment.title} meta={moment.place} detail={moment.mood} badge={moment.format} action={moment.audio ? "Join room" : "View event"} tone="events" />
          ))}
        </CardGrid>
      </SectionShell>
    </>
  );
}

function LiveRoomsPage({ cityImage }: { cityImage: string }) {
  const ecosystem = MOCK_ECOSYSTEM.rome;

  return (
    <>
      <FilterPills items={["All", "Live now", "Starting soon", "Open call", "Near you"]} />
      <section className="live-room-hero">
        <div className="room-hero-media" style={{ backgroundImage: `url("${cityImage}")` }}>
          <MiniWave />
        </div>
        <div>
          <p className="internal-eyebrow">Live now / San Lorenzo</p>
          <h2>Spatial Conversations with Cava Studio</h2>
          <p>Exploring sound, space and collective presence with 42 listeners.</p>
          <button type="button">Enter room</button>
        </div>
      </section>
      <SectionShell title="Live now" action="Open all">
        <CardGrid>
          {ecosystem.tonight.map((moment) => (
            <RoomCard key={moment.title} title={moment.title} place={moment.place} listeners={moment.audio ? "42 listening" : "18 waiting"} />
          ))}
        </CardGrid>
      </SectionShell>
    </>
  );
}

function SpacesPage() {
  return (
    <>
      <FilterPills items={["All", "Studio", "Gallery", "Event", "Residency", "Coworking"]} />
      <SectionShell title="Featured spaces" action="Request access">
        <CardGrid>{spaces.map((space) => <InfoCard key={space.title} {...space} action="View space" />)}</CardGrid>
      </SectionShell>
      <SectionShell title="Available tonight" action="Open map">
        <CompactRows items={spaces} action="Request access" />
      </SectionShell>
    </>
  );
}

function CollectivesPage() {
  return (
    <>
      <FilterPills items={["All", "Recruiting", "Sound", "Image", "Performance", "This week"]} />
      <SectionShell title="Looking for collaborators" action="View all">
        <CardGrid>{collectives.map((collective) => <InfoCard key={collective.title} title={collective.title} type={collective.discipline} city={collective.city} status={`${collective.members} / ${collective.status}`} tone={collective.tone} action="Join" />)}</CardGrid>
      </SectionShell>
      <SectionShell title="Active this week" action="Open feed">
        <DenseList items={collectives.map((collective) => `${collective.title} / ${collective.status}`)} />
      </SectionShell>
    </>
  );
}

function OpenCallsPage() {
  return (
    <>
      <FilterPills items={["All", "Paid", "Closing soon", "Remote", "Rome", "Sound", "Visual"]} />
      <SectionShell title="Matched to your profile" action="View all">
        <CardGrid>{openCalls.map((call) => <CallCard key={call.title} {...call} />)}</CardGrid>
      </SectionShell>
      <SectionShell title="Closing soon" action="Browse calls">
        <CompactRows items={openCalls} action="Apply" />
      </SectionShell>
    </>
  );
}

function AiMatchPage({ ecosystem }: { ecosystem: typeof MOCK_ECOSYSTEM.rome }) {
  return (
    <>
      <section className="match-hero">
        <div className="match-ring"><strong>92%</strong><span>scene fit</span></div>
        <div>
          <p className="internal-eyebrow">Recommended path</p>
          <h2>Spatial sound + analog image</h2>
          <p>Your rooms, collaborators and nearby activity suggest three strong routes tonight.</p>
          <div className="skill-chips"><span>Sound</span><span>Projection</span><span>Live rooms</span><span>Open calls</span></div>
        </div>
      </section>
      <SectionShell title="Suggested matches" action="Review all">
        <CardGrid>{ecosystem.matchedSignals.map((signal) => <SignalCard key={signal.label} title={signal.label} detail={signal.detail} status={signal.confidence} />)}</CardGrid>
      </SectionShell>
      <SectionShell title="Why matched" action="Tune profile">
        <DenseList items={["You listened to two spatial rooms this week", "Cava Studio needs projection support", "Ostiense has an active media cluster", "Three collaborators overlap your practice"]} />
      </SectionShell>
    </>
  );
}

function ActivityPage({ activities }: { activities: typeof MOCK_ACTIVITY_FEED.rome }) {
  return (
    <>
      <FilterPills items={["All", "Collaborations", "Events", "System", "Messages"]} />
      <section className="activity-layout">
        <div className="activity-timeline">
          {activities.concat(activities).map((item, index) => (
            <article key={`${item.actor}-${index}`} className="activity-row" data-tone={activityTone(item.kind)}>
              <span />
              <div>
                <p><strong>{item.actor}</strong> {item.action}</p>
                <small>{item.place} / {item.time}</small>
              </div>
              <button type="button">{index % 2 ? "Respond" : "View"}</button>
            </article>
          ))}
        </div>
        <aside className="activity-side">
          <CompactSignal title="Suggested for you" action="View all" items={["Elena Martinelli / 92% match", "Light artist for live score", "Spatial Conversations live now"]} tone="match" />
        </aside>
      </section>
    </>
  );
}

function FeaturedScene({ image, title = "Afterlight Studies", action = "Enter room" }: { image: string; title?: string; action?: string }) {
  return (
    <article className="internal-feature-card" style={{ backgroundImage: `url("${image}")` }}>
      <span>Featured scene</span>
      <div>
        <p>Ostiense / 21:30</p>
        <h2>{title}</h2>
        <button type="button">{action}</button>
      </div>
    </article>
  );
}

function SectionShell({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section className="internal-section">
      <header>
        <h2>{title}</h2>
        <button type="button">{action}</button>
      </header>
      {children}
    </section>
  );
}

function CardGrid({ children }: { children: ReactNode }) {
  return <div className="internal-card-grid">{children}</div>;
}

function MediaCard({ image, title, meta, detail, badge, action, tone }: { image: string; title: string; meta: string; detail: string; badge: string; action: string; tone: Tone }) {
  return (
    <article className="internal-media-card" data-tone={tone}>
      <div style={{ backgroundImage: `url("${image}")` }}><span>{badge}</span></div>
      <p>{meta}</p>
      <h3>{title}</h3>
      <small>{detail}</small>
      <button type="button">{action}</button>
    </article>
  );
}

function PersonGrid() {
  return (
    <div className="person-grid">
      {artists.map((artist) => (
        <article key={artist.name} className="person-card" data-tone={artist.tone}>
          <span className="person-avatar">{artist.name.split(" ").map((part) => part[0]).join("")}</span>
          <div>
            <h3>{artist.name}</h3>
            <p>{artist.role} / {artist.city}</p>
            <small>{artist.match} / {artist.status}</small>
          </div>
          <button type="button">Connect</button>
        </article>
      ))}
    </div>
  );
}

function InfoCard({ title, type, city, status, tone, action }: { title: string; type: string; city: string; status: string; tone: Tone; action: string }) {
  return (
    <article className="info-card" data-tone={tone}>
      <p>{city}</p>
      <h3>{title}</h3>
      <small>{type}</small>
      <span>{status}</span>
      <button type="button">{action}</button>
    </article>
  );
}

function CallCard({ title, organizer, need, deadline, reward, tone }: { title: string; organizer: string; need: string; deadline: string; reward: string; tone: Tone }) {
  return (
    <article className="info-card call-card" data-tone={tone}>
      <p>{organizer}</p>
      <h3>{title}</h3>
      <small>{need}</small>
      <span>{deadline} / {reward}</span>
      <button type="button">Apply</button>
    </article>
  );
}

function SignalCard({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <article className="signal-card" data-tone="match">
      <p>Suggested match</p>
      <h3>{title}</h3>
      <small>{detail}</small>
      <span>{status}</span>
      <button type="button">Review match</button>
    </article>
  );
}

function RoomCard({ title, place, listeners }: { title: string; place: string; listeners: string }) {
  return (
    <article className="room-card" data-tone="audio">
      <p>{place}</p>
      <h3>{title}</h3>
      <MiniWave />
      <small>{listeners}</small>
      <button type="button">Enter room</button>
    </article>
  );
}

function CompactSignal({ title, action, items, tone }: { title: string; action: string; items: string[]; tone: Tone }) {
  return (
    <aside className="compact-signal" data-tone={tone}>
      <header><h2>{title}</h2><button type="button">{action}</button></header>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </aside>
  );
}

function CompactRows({
  items,
  action,
}: {
  items: Array<{ title?: string; name?: string; role?: string; type?: string; need?: string; discipline?: string; organizer?: string; city?: string; deadline?: string; status?: string }>;
  action: string;
}) {
  return (
    <div className="compact-rows">
      {items.map((item) => (
        <article key={item.title ?? item.name}>
          <div>
            <h3>{item.title ?? item.name}</h3>
            <p>{item.role ?? item.type ?? item.need ?? item.discipline ?? item.organizer} / {item.city ?? item.deadline ?? item.status}</p>
          </div>
          <button type="button">{action}</button>
        </article>
      ))}
    </div>
  );
}

function DenseList({ items }: { items: string[] }) {
  return (
    <div className="dense-list">
      {items.map((item, index) => (
        <p key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>
      ))}
    </div>
  );
}

function MiniWave() {
  return (
    <div className="mini-wave" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => <span key={index} style={{ height: `${30 + ((index * 17) % 42)}%` }} />)}
    </div>
  );
}

function activityTone(kind: string): Tone {
  if (kind === "room" || kind === "session") return "audio";
  if (kind === "collaboration" || kind === "collective") return "collectives";
  if (kind === "arrival") return "spaces";
  if (kind === "work") return "artists";
  return "events";
}
