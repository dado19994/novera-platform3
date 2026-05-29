"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CitySelector } from "@/components/city-media/city-selector";
import { CreativeMapPreview } from "@/components/map/CreativeMapPreview";
import { useCityMedia } from "@/components/city-media/city-media-provider";
import { CinematicCard } from "@/components/ui/cinematic-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import type { CityMedia } from "@/lib/city-media";
import { MOCK_ACTIVITY_FEED, MOCK_ECOSYSTEM, type AmbientActivity, type CityEcosystem, type CulturalMoment } from "@/lib/mock-data";

export function HomeExperience() {
  const { city, media } = useCityMedia();
  const reducedMotion = useReducedMotion();
  // Laravel API handoff: lib/data/discovery.ts already exposes the mock-first
  // discovery boundary. Connect its adapted view model here in a later phase.
  const ecosystem = MOCK_ECOSYSTEM[city];
  const activityFeed = MOCK_ACTIVITY_FEED[city];
  const movement = reducedMotion ? { duration: 0 } : { duration: 0.62, ease: "easeOut" as const };

  return (
    <>
      <TopBar />
      <main className="pt-5 sm:pt-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={city}
            initial={reducedMotion ? false : { opacity: 0, y: 15, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -7, filter: "blur(4px)" }}
            transition={movement}
            className="experience-flow operating-home"
          >
            <section className="product-hero">
              <HeroNarrative media={media} ecosystem={ecosystem} />
              <CreativeMapPreview ecosystem={ecosystem} media={media} reducedMotion={Boolean(reducedMotion)} />
              <QuickAccess />
            </section>

            <section className="ecosystem-dashboard" aria-label="Live ecosystem overview">
              <FeaturedLiveModule ecosystem={ecosystem} media={media} />
              <MatchedSignals ecosystem={ecosystem} />
              <OpportunityLayer ecosystem={ecosystem} />
              <LivingActivityFeed activities={activityFeed} />
              <AudioPreview ecosystem={ecosystem} />
            </section>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <header className="top-bar flex items-center justify-between">
      <button className="mobile-menu" type="button" aria-label="Open navigation">
        <span />
        <span />
        <span />
      </button>
      <div className="top-brand flex items-center gap-3">
        <div className="brand-orbit flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04]">
          <span className="h-3.5 w-3.5 rounded-full border border-(--amber-glow) shadow-[0_0_18px_var(--scene-primary)]" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.14em] uppercase">Novera</p>
          <p className="text-[0.62rem] uppercase tracking-[0.25em] text-(--muted-ivory)">Creative map</p>
        </div>
      </div>
      <div className="top-actions hidden items-center gap-7 text-sm text-(--muted-ivory) sm:flex">
        <button className="transition-colors hover:text-(--soft-ivory)">Scenes</button>
        <button className="transition-colors hover:text-(--soft-ivory)">Open calls</button>
        <button className="portal-cta portal-cta-secondary">
          <span>Share work</span>
          <span className="portal-arrow" aria-hidden="true">+</span>
        </button>
      </div>
      <button className="mobile-profile" type="button" aria-label="Open creator profile">
        LM
        <span />
      </button>
    </header>
  );
}

function HeroNarrative({ media, ecosystem }: { media: CityMedia; ecosystem: CityEcosystem }) {
  return (
    <section className="hero-narrative hero-editorial">
      <div className="hero-copy">
        <p className="hero-kicker flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.3em] text-(--muted-ivory)">
          <span className="live-beacon inline-block h-2 w-2 rounded-full" style={{ background: "var(--rose)" }} />
          Welcome to Novera / {media.city}
        </p>
        <h1 className="hero-title">
          Discover.<br />
          Create.<br />
          Collaborate.<br />
          <span>Beyond.</span>
        </h1>
        <p className="hero-description">
          A living cultural ecosystem for artists, events and creative collectives.
          Explore scenes, join rooms and shape what moves next.
        </p>
        <div className="hero-actions">
          <button className="portal-cta portal-cta-prominent portal-cta-primary" type="button">
            <span>Explore ecosystem</span>
            <span className="portal-arrow" aria-hidden="true">+</span>
          </button>
          <button className="hero-secondary" type="button">Start collaboration</button>
        </div>
        <div className="hero-city">
          <CitySelector />
        </div>
      </div>
      <div className="hero-pulse">
        <CityStatusStrip ecosystem={ecosystem} />
      </div>
    </section>
  );
}

const QUICK_ACCESS = [
  { label: "Artists", detail: "Discover voices", status: "148 live", tone: "artists" },
  { label: "Events", detail: "Tonight nearby", status: "14 soon", tone: "events" },
  { label: "Live Rooms", detail: "Join sessions", status: "6 live", tone: "live" },
  { label: "Spaces", detail: "Explore places", status: "New", tone: "spaces" },
  { label: "Collectives", detail: "Find a circle", status: "9 recruiting", tone: "collectives" },
  { label: "Audio", detail: "Spatial radio", status: "Live", tone: "audio" },
  { label: "AI Match", detail: "For your craft", status: "3 matches", tone: "match" },
  { label: "Open Calls", detail: "Join a project", status: "Open", tone: "opportunities" },
] as const;

function QuickAccess() {
  return (
    <section className="quick-access editorial-band" aria-label="Explore the Novera ecosystem">
      <header className="quick-access-header">
        <div>
          <p className="quick-access-eyebrow">Explore</p>
          <h2>Quick access</h2>
        </div>
        <p>Enter the ecosystem by practice, scene or opportunity.</p>
      </header>
      <div className="quick-access-grid">
        {QUICK_ACCESS.map(({ label, detail, status, tone }) => (
          <button className={`quick-access-card access-${tone}`} type="button" key={label}>
            <span className="access-head">
              <span className={`access-glyph nav-glyph nav-${tone}`} aria-hidden="true" />
              <span className="access-status">{status}</span>
            </span>
            <strong>{label}</strong>
            <small>{detail}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function CityStatusStrip({ ecosystem }: { ecosystem: CityEcosystem }) {
  const cellConfig = [
    { label: "Artists",     accent: "var(--violet-soft)", dotColor: "bg-(--rose)", showBeacon: true },
    { label: "Collectives", accent: "var(--collective)",  dotColor: "",             showBeacon: false },
    { label: "Events",      accent: "var(--rose)",        dotColor: "",             showBeacon: false },
    { label: "Audio rooms", accent: "var(--teal)",        dotColor: "",             showBeacon: false },
  ];

  return (
    <div className="city-status-strip grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-4">
      {ecosystem.livePulse.map((signal, index) => {
        const cfg = cellConfig[index] ?? cellConfig[0];
        return (
          <div key={signal.label} className="city-status-cell rounded-[1.2rem] px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p
                className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em]"
                style={{ color: cfg.accent }}
              >
                {cfg.label}
              </p>
              {cfg.showBeacon && <span className="live-beacon h-1.5 w-1.5 shrink-0 rounded-full" />}
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <p
                className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-[0.04em]"
                style={{ color: cfg.accent }}
              >
                {signal.value}
              </p>
              <p className="truncate text-[0.68rem] text-(--muted-ivory)">{signal.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeaturedSceneMoment({
  media,
  moment,
  ecosystem,
  className = "",
}: {
  media: CityMedia;
  moment: CulturalMoment;
  ecosystem: CityEcosystem;
  className?: string;
}) {
  return (
    <article className={`featured-moment surface-media depth-card relative overflow-hidden rounded-[1.8rem] ${className}`}>
      <div
        className="featured-cover absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 6, 14, 0.05) 0%, rgba(8, 6, 14, 0.55) 60%, rgba(8, 6, 14, 0.88) 100%), url("${media.imageSrc}")`,
          backgroundPosition: media.focalPoint,
        }}
      />
      <div className="featured-content relative flex min-h-[295px] flex-col justify-between gap-10 p-5 sm:min-h-[330px] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="featured-live">
            <span className="live-beacon" />
            Featured scene moment
          </span>
          <span className="featured-format">{moment.format}</span>
        </div>
        <div>
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-(--acid)">
            {moment.place} / {moment.time}
          </p>
          <h2 className="max-w-[19rem] font-[family-name:var(--font-display)] text-[2rem] leading-[1.04] tracking-[-0.04em] text-(--soft-ivory) sm:text-[2.35rem]">
            {moment.title}
          </h2>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AvatarStack artists={moment.artists} />
              <span className="text-xs text-(--muted-ivory)">{ecosystem.livePulse[0].value} active nearby</span>
            </div>
            <button className="featured-action portal-cta portal-cta-live" type="button">
              <span>{moment.action}</span>
              <span className="portal-arrow" aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function activityBadgeStyle(kind: AmbientActivity["kind"]): { [key: string]: string } {
  if (kind === "room" || kind === "session") {
    return {
      background: "rgba(255, 61, 127, 0.12)",
      border: "0.5px solid rgba(255, 61, 127, 0.35)",
      color: "var(--rose)",
    };
  }
  if (kind === "collaboration" || kind === "collective") {
    return {
      background: "rgba(245, 155, 61, 0.10)",
      border: "0.5px solid rgba(245, 155, 61, 0.30)",
      color: "var(--collective)",
    };
  }
  if (kind === "arrival") {
    return {
      background: "rgba(0, 212, 180, 0.10)",
      border: "0.5px solid rgba(0, 212, 180, 0.30)",
      color: "var(--teal)",
    };
  }
  return {
    background: "rgba(155, 127, 255, 0.12)",
    border: "0.5px solid rgba(155, 127, 255, 0.35)",
    color: "var(--violet-soft)",
  };
}

function LivingActivityFeed({
  activities,
  className = "",
}: {
  activities: AmbientActivity[];
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <section className={`editorial-band activity-panel overflow-hidden p-4 sm:p-5 ${className}`}>
      <SectionHeader eyebrow="Living activity" title="Scene transmissions" action="See all" actionTone="events" />
      <p className="section-purpose">Recent joins, collaborations and live signals from your cultural ecosystem.</p>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <motion.div
            key={`${activity.actor}-${activity.action}`}
            className="activity-item flex gap-3 rounded-2xl px-3 py-3"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : index * 0.09, duration: reducedMotion ? 0 : 0.38 }}
          >
            <span className={`activity-mark activity-${activity.kind} mt-1.5 block h-2 w-2 shrink-0 rounded-full`} />
            <div className="activity-copy min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2 py-1 text-[0.57rem] uppercase tracking-[0.17em]"
                  style={activityBadgeStyle(activity.kind)}
                >
                  {activityCategory(activity.kind)}
                </span>
                <time className="activity-time text-[0.61rem] uppercase tracking-[0.18em] text-(--muted-ivory)">
                  {activity.time}
                </time>
              </div>
              <p className="text-sm text-(--soft-ivory)">
                <span className="font-medium">{activity.actor}</span>{" "}
                <span className="text-(--muted-ivory)">{activity.action}</span>
              </p>
              <p className="activity-place mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-(--muted-ivory)">
                {activity.place}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function activityCategory(kind: AmbientActivity["kind"]) {
  if (kind === "collaboration" || kind === "collective") {
    return "Open call";
  }

  if (kind === "room" || kind === "session") {
    return "Live";
  }

  return kind === "arrival" ? "Arrival" : "Work";
}

function MatchedSignals({ ecosystem }: { ecosystem: CityEcosystem }) {
  return (
    <section className="editorial-band practice-strip p-4 sm:p-5">
      <SectionHeader eyebrow="For your practice" title="Matched signals" action="Review matches" actionTone="opportunities" />
      <p className="practice-intro">
        Recommendations shaped by your rooms, collaborators and tonight&apos;s nearby activity.
      </p>
      <div className="practice-signals mt-4 gap-3 sm:grid sm:grid-cols-3">
        {ecosystem.matchedSignals.map((signal, index) => (
          <CinematicCard key={signal.label} breathe={index === 0} className="practice-signal flex min-w-0 flex-col gap-3 p-3.5">
            <div className="practice-recommendation flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="practice-match text-[0.6rem] uppercase tracking-[0.2em]">Suggested match</p>
                <p className="practice-title mt-2 text-sm font-medium text-(--soft-ivory)">{signal.label}</p>
                <p className="mt-1 text-xs text-(--muted-ivory)">{signal.detail}</p>
              </div>
              <span
                className="practice-signal-dot mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: ["var(--rose)", "var(--collective)", "var(--violet-soft)"][index] ?? "var(--violet-soft)",
                  boxShadow: [
                    "0 0 8px rgba(255,61,127,0.6)",
                    "0 0 8px rgba(245,155,61,0.5)",
                    "0 0 8px rgba(155,127,255,0.5)",
                  ][index] ?? "none",
                }}
              />
            </div>
            <div className="practice-footer flex items-center justify-between gap-3">
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-(--collective)">{signal.confidence}</p>
              <button className="practice-action" type="button" aria-label={`Review match: ${signal.label}`}>
                Review match
              </button>
            </div>
          </CinematicCard>
        ))}
      </div>
    </section>
  );
}

function FeaturedLiveModule({ ecosystem, media }: { ecosystem: CityEcosystem; media: CityMedia }) {
  return (
    <section className="featured-live-module module-panel" aria-label="Featured and live now">
      <SectionHeader eyebrow="Featured & live now" title="Cultural movement" action="See all" actionTone="events" />
      <p className="section-purpose">Active rooms, screenings and listening sessions happening tonight.</p>
      <div className="featured-live-cards">
        <FeaturedSceneMoment
          media={media}
          moment={ecosystem.tonight[0]}
          ecosystem={ecosystem}
          className="featured-live-primary"
        />
        <TonightMovement ecosystem={ecosystem} media={media} supporting embedded />
      </div>
    </section>
  );
}

function TonightMovement({ ecosystem, media, supporting = false, embedded = false }: {
  ecosystem: CityEcosystem;
  media: CityMedia;
  supporting?: boolean;
  embedded?: boolean;
}) {
  const moments = supporting ? ecosystem.tonight.slice(1) : ecosystem.tonight;

  return (
    <section className={`movement-panel editorial-band rounded-[1.65rem] p-5 sm:p-6 ${supporting ? "supporting-movement" : ""} ${embedded ? "embedded-movement" : ""}`}>
      {!embedded && <SectionHeader eyebrow="Featured & live now" title="Cultural movement" action="See all" actionTone="events" />}
      {!embedded && <p className="section-purpose">Enter tonight&apos;s active rooms, screenings and listening sessions.</p>}
      <div className="movement-gallery mt-5">
        {moments.map((moment, index) => {
          const toneIndex = supporting ? index + 1 : index;

          return (
          <article
            key={moment.title}
            className={`movement-card surface-media depth-card movement-card-${toneIndex} overflow-hidden rounded-[1.25rem]`}
          >
            <div className="movement-cover relative min-h-[10.25rem] p-4">
              <div
                className="movement-image absolute inset-0"
                style={{
                  backgroundImage: `url("${media.imageSrc}")`,
                  backgroundPosition: `${media.focalPoint.split(" ")[0]} ${toneIndex === 0 ? "35%" : toneIndex === 1 ? "52%" : "68%"}`,
                }}
              />
              <div className="movement-media-head relative z-10 flex items-start justify-between gap-2">
                <span className="movement-badge">{moment.format}</span>
                <span className="text-[0.68rem] text-(--soft-ivory)/72">{moment.time}</span>
              </div>
              <MiniWaveform tone={toneIndex} />
            </div>
            <div className="movement-body p-4">
              <div className="movement-meta flex items-center justify-between gap-2">
                <span
                  className="text-[0.63rem] uppercase tracking-[0.2em]"
                  style={{ color: ["var(--rose)", "var(--violet-soft)", "var(--teal)"][toneIndex] ?? "var(--violet-soft)" }}
                >
                  {moment.kind}
                </span>
                <span className="text-[0.63rem] uppercase tracking-[0.2em] text-(--collective)">{moment.place}</span>
              </div>
              <h3 className="movement-title mt-4 font-[family-name:var(--font-display)] text-xl leading-snug text-(--soft-ivory)">
                {moment.title}
              </h3>
              <p className="movement-mood mt-2 text-sm text-(--muted-ivory)">{moment.mood}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <AvatarStack artists={moment.artists} />
                <button className="movement-action portal-cta" type="button">
                  <span>{moment.action}</span>
                  <span className="portal-arrow" aria-hidden="true">+</span>
                </button>
              </div>
            </div>
          </article>
        );
        })}
      </div>
    </section>
  );
}

function OpportunityLayer({
  ecosystem,
  className = "",
}: {
  ecosystem: CityEcosystem;
  className?: string;
}) {
  return (
    <section className={`editorial-band opportunity-panel p-5 sm:p-6 ${className}`}>
      <SectionHeader eyebrow="Collaboration / open calls" title="Opportunities for you" action="Browse calls" actionTone="opportunities" />
      <p className="section-purpose">Join projects, find collaborators and respond to creator opportunities.</p>
      <div className="space-y-4">
        {ecosystem.opportunities.map((opportunity, index) => (
          <div
            key={opportunity.title}
            className={`border-b border-white/8 pb-4 last:border-0 last:pb-0 ${index >= 1 ? "hidden sm:block" : ""}`}
          >
            <p className="text-sm text-(--soft-ivory)">{opportunity.title}</p>
            <p className="mt-2 text-xs text-(--muted-ivory)">
              {opportunity.creator} / {opportunity.need}
            </p>
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.21em] text-(--collective)">
              <span className="opportunity-badge">{opportunity.deadline}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AvatarStack({ artists }: { artists: string[] }) {
  return (
    <div className="avatar-stack flex items-center" aria-label={`${artists.length} artists present`}>
      {artists.map((artist) => (
        <span className="artist-avatar" key={artist}>
          {artist}
        </span>
      ))}
    </div>
  );
}

function MiniWaveform({ tone = 0 }: { tone?: number }) {
  return (
    <div className={`mini-waveform mini-waveform-${tone}`} aria-hidden="true">
      {[34, 60, 45, 76, 41, 64, 31].map((height, index) => (
        <span
          className="mini-wave-bar"
          key={`${height}-${index}`}
          style={{ height: `${height}%`, animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}

function AudioPreview({
  ecosystem,
  className = "",
}: {
  ecosystem: CityEcosystem;
  className?: string;
}) {
  const heights = [35, 62, 42, 78, 56, 93, 51, 74, 42, 66, 38, 58, 29];

  return (
    <GlassPanel className={`editorial-panel surface-luminous audio-presence depth-card overflow-hidden p-5 sm:p-6 ${className}`}>
      <SectionHeader eyebrow="Immersive audio / live" title={ecosystem.audio.title} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium" style={{ color: "var(--teal)" }}>{ecosystem.audio.artist}</p>
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: "var(--teal)" }}>
          <span className="audio-live-dot h-1.5 w-1.5 rounded-full" />
          Listening room live
        </span>
      </div>
      <p className="mt-2 text-xs text-(--muted-ivory)">{ecosystem.audio.context}</p>
      <div className="audio-energy mt-6 flex items-center gap-4">
        <span className="audio-resonance" aria-hidden="true" />
        <button
          type="button"
          aria-label={`Play ${ecosystem.audio.title}`}
          className="audio-control relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-(--graphite)"
        >
          <span className="ml-0.5 text-sm" aria-hidden="true">&#9654;</span>
        </button>
        <div className="audio-waveform flex h-10 flex-1 items-end gap-[3px]" aria-hidden="true">
          {heights.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="wave-bar block w-full rounded-full"
              style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
            />
          ))}
        </div>
        <span className="text-xs text-(--muted-ivory)">{ecosystem.audio.length}</span>
      </div>
    </GlassPanel>
  );
}
