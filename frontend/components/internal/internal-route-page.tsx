import { CityMediaProvider } from "@/components/city-media/city-media-provider";
import { CitySelector } from "@/components/city-media/city-selector";
import { AppShell } from "@/components/layout/app-shell";
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
      {config.kind === "creative-map" && <CreativeMapPage cityImage={city.imageSrc} ecosystem={ecosystem} />}
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

function CreativeMapPage({ cityImage, ecosystem }: { cityImage: string; ecosystem: typeof MOCK_ECOSYSTEM.rome }) {
  const baseTones = ["events", "opportunities", "audio", "spaces"] as const;

  // ── Node layout: three intentional clusters ────────────────────────────────
  // LEFT cluster:   SanLorenzo (0), Monti (7), Prati (9)
  // CENTER cluster: CentroStorico (4), Ostiense (1), Testaccio (5), Trastevere (3)
  // RIGHT cluster:  Pigneto (2), Torpignattara (8), Garbatella (6)
  const expandedNodes = [
    ...ecosystem.mapNodes.map((node, index) => ({ ...node, tone: (baseTones[index] ?? "neutral") as Tone })),
    // Center crossroads
    { label: "Centro Storico", activity: "Cultural route",    x: 47, y: 40, tone: "artists"    as Tone },
    // South-east cluster
    { label: "Testaccio",      activity: "Open call",         x: 62, y: 65, tone: "collectives" as Tone },
    { label: "Garbatella",     activity: "Studio open",       x: 74, y: 55, tone: "spaces"     as Tone },
    // North-west cluster
    { label: "Monti",          activity: "Exhibition trail",  x: 32, y: 26, tone: "match"      as Tone },
    // Far east
    { label: "Torpignattara",  activity: "Listening cell",    x: 84, y: 40, tone: "audio"      as Tone },
    // West
    { label: "Prati",          activity: "Artist cluster",    x: 23, y: 57, tone: "artists"    as Tone },
  ];

  // Short aliases for readability
  const [eN0, eN1, eN2, eN3, eN4, eN5, eN6, eN7, eN8, eN9] = expandedNodes;

  // ── 4 Primary routes — intentional network topology ───────────────────────
  // 1. Cultural spine (rose/events): left cluster → center → right, northern arc
  // 2. Mid-city spine (teal/audio): west → center → east, horizontal mid-band
  // 3. Southern circuit (collective/collectives): south-west arc through bottom districts
  // 4. Diagonal cross (violet/artists): north-west → center → south-west
  const fullMapPrimaryRoutes = [
    {
      id: "cultural-spine",
      tone: "events",
      d: `M ${eN0.x} ${eN0.y} C 28 29, 38 34, ${eN4.x} ${eN4.y} C 57 29, 65 25, ${eN2.x} ${eN2.y} C 79 28, 82 34, ${eN8.x} ${eN8.y}`,
    },
    {
      id: "mid-city-spine",
      tone: "audio",
      d: `M ${eN9.x} ${eN9.y} C 36 52, 47 54, ${eN1.x} ${eN1.y} C 65 53, 70 54, ${eN6.x} ${eN6.y}`,
    },
    {
      id: "southern-circuit",
      tone: "collectives",
      d: `M ${eN3.x} ${eN3.y} C 44 71, 54 68, ${eN5.x} ${eN5.y} C 67 63, 71 59, ${eN6.x} ${eN6.y}`,
    },
    {
      id: "diagonal-cross",
      tone: "artists",
      d: `M ${eN7.x} ${eN7.y} C 38 31, 43 36, ${eN4.x} ${eN4.y} C 51 46, 54 50, ${eN1.x} ${eN1.y} C 52 62, 44 67, ${eN3.x} ${eN3.y}`,
    },
  ];

  // ── 8 Secondary routes — filling cluster connections ──────────────────────
  const secondaryRoutes = [
    // Left cluster internal
    { id: "sl-monti",      tone: "match",       d: `M ${eN0.x} ${eN0.y} C 23 30, 28 28, ${eN7.x} ${eN7.y}` },
    { id: "sl-prati",      tone: "events",      d: `M ${eN0.x} ${eN0.y} C 19 43, 21 51, ${eN9.x} ${eN9.y}` },
    // Left → center bridge
    { id: "sl-centro",     tone: "artists",     d: `M ${eN0.x} ${eN0.y} C 28 34, 38 37, ${eN4.x} ${eN4.y}` },
    // Center connections
    { id: "centro-test",   tone: "collectives", d: `M ${eN4.x} ${eN4.y} C 51 49, 56 58, ${eN5.x} ${eN5.y}` },
    { id: "os-torpig",     tone: "audio",       d: `M ${eN1.x} ${eN1.y} C 67 47, 76 44, ${eN8.x} ${eN8.y}` },
    // Right cluster internal
    { id: "pig-garb",      tone: "audio",       d: `M ${eN2.x} ${eN2.y} C 74 37, 74 46, ${eN6.x} ${eN6.y}` },
    // South-west connection
    { id: "prati-trast",   tone: "spaces",      d: `M ${eN9.x} ${eN9.y} C 26 63, 31 67, ${eN3.x} ${eN3.y}` },
    // Northern arc
    { id: "monti-pig",     tone: "match",       d: `M ${eN7.x} ${eN7.y} C 45 20, 60 21, ${eN2.x} ${eN2.y}` },
  ];

  // ── Curated atmospheric signal dots — 2 per hub, placed by composition
  const microSignalDefs: { n: number; xOff: number; yOff: number }[] = [
    { n: 0, xOff: -7, yOff: -7 }, { n: 0, xOff:  8, yOff:  6 },
    { n: 1, xOff: -8, yOff: -7 }, { n: 1, xOff:  9, yOff:  6 },
    { n: 2, xOff: -8, yOff:  6 }, { n: 2, xOff:  7, yOff: -7 },
    { n: 3, xOff:  8, yOff: -6 }, { n: 3, xOff: -7, yOff:  6 },
    { n: 4, xOff: -7, yOff: -6 }, { n: 4, xOff:  6, yOff:  7 },
    { n: 5, xOff: -6, yOff: -5 }, { n: 5, xOff:  7, yOff:  5 },
    { n: 6, xOff: -7, yOff: -5 }, { n: 6, xOff:  6, yOff:  6 },
    { n: 7, xOff:  7, yOff:  5 }, { n: 7, xOff: -7, yOff: -5 },
    { n: 8, xOff: -8, yOff:  5 }, { n: 8, xOff: -6, yOff: -7 },
    { n: 9, xOff:  7, yOff: -6 }, { n: 9, xOff: -7, yOff:  6 },
  ];
  const microSignals = microSignalDefs.map(({ n, xOff, yOff }, i) => ({
    id: `ms-${i}`,
    nodeIndex: n,
    tone: expandedNodes[n].tone,
    x: Math.max(7, Math.min(93, expandedNodes[n].x + xOff)),
    y: Math.max(8, Math.min(88, expandedNodes[n].y + yOff)),
  }));

  return (
    <section className="full-map-stage">
      <div className="full-map-toolbar">
        <CitySelector />
        <FilterPills items={["Artists", "Events", "Collectives", "Spaces", "Live rooms"]} />
      </div>
      <div className="full-map-canvas">
        <div className="full-map-image" style={{ backgroundImage: `url("${cityImage}")` }} />
        <svg className="full-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {microSignals.map((signal) => {
            const anchor = expandedNodes[signal.nodeIndex];
            return <line key={signal.id} className="full-map-route-micro" x1={signal.x} y1={signal.y} x2={anchor.x} y2={anchor.y} />;
          })}
          {secondaryRoutes.map((route) => (
            <path key={route.id} className={`full-map-route-secondary route-${route.tone}`} d={route.d} fill="none" />
          ))}
          {fullMapPrimaryRoutes.map((route) => (
            <path key={route.id} className={`full-map-route-primary route-${route.tone}`} d={route.d} fill="none" />
          ))}
          {fullMapPrimaryRoutes.map((route) => (
            <path key={`${route.id}-pulse`} className={`full-map-route-pulse route-${route.tone}`} d={route.d} fill="none" />
          ))}
        </svg>
        {microSignals.map((signal) => (
          <span key={signal.id} className="full-map-signal" data-tone={signal.tone} style={{ left: `${signal.x}%`, top: `${signal.y}%` }} />
        ))}
        {expandedNodes.map((node) => (
          <div key={node.label} className="full-map-node" data-tone={node.tone} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <span />
            <strong>{node.label}</strong>
            <small>{node.activity}</small>
          </div>
        ))}
        <aside className="map-side-panel">
          <p className="internal-eyebrow">Selected signal</p>
          <h2>San Lorenzo</h2>
          <p>Live room / 42 listening. Projection artists nearby and one open collaboration.</p>
          <button type="button">Enter room</button>
        </aside>
        <div className="map-controls-stack" aria-hidden="true"><span>+</span><span>-</span><span>⌖</span></div>
      </div>
      <div className="map-live-ticker">
        <span>Scene transmission</span>
        <strong>San Lorenzo / Explore room / 42 listening</strong>
        <em>Live ecosystem map</em>
      </div>
    </section>
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
