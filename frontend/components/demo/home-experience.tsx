"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { CitySelector } from "@/components/city-media/city-selector";
import { useCityMedia } from "@/components/city-media/city-media-provider";
import { CinematicCard } from "@/components/ui/cinematic-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import type { CityMedia } from "@/lib/city-media";
import { MOCK_ACTIVITY_FEED, MOCK_ECOSYSTEM, type ActivityState, type AmbientActivity, type CityEcosystem, type CulturalMoment } from "@/lib/mock-data";

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
            className="space-y-4 sm:space-y-5"
          >
            <SceneHeader media={media} />
            <CityStatusStrip ecosystem={ecosystem} />

            <section className="scene-columns grid xl:grid-cols-[minmax(690px,1.78fr)_minmax(322px,0.7fr)]">
              <div className="scene-main order-2 xl:order-1">
                <CreativeMap ecosystem={ecosystem} media={media} reducedMotion={Boolean(reducedMotion)} />
                <TonightMovement ecosystem={ecosystem} media={media} />
                <MatchedSignals ecosystem={ecosystem} />
              </div>
              <aside className="scene-rail order-1 xl:order-2">
                <FeaturedSceneMoment media={media} moment={ecosystem.tonight[0]} ecosystem={ecosystem} />
                <LivingActivityFeed activities={activityFeed} />
                <OpportunityLayer ecosystem={ecosystem} />
                <AudioPreview ecosystem={ecosystem} />
              </aside>
            </section>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="brand-orbit flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04]">
          <span className="h-3.5 w-3.5 rounded-full border border-(--amber-glow) shadow-[0_0_18px_var(--scene-primary)]" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.14em] uppercase">Novera</p>
          <p className="text-[0.62rem] uppercase tracking-[0.25em] text-(--muted-ivory)">Creative map</p>
        </div>
      </div>
      <div className="hidden items-center gap-7 text-sm text-(--muted-ivory) sm:flex">
        <button className="transition-colors hover:text-(--soft-ivory)">Scenes</button>
        <button className="transition-colors hover:text-(--soft-ivory)">Open calls</button>
        <button className="rounded-full border border-white/12 px-5 py-2.5 text-(--soft-ivory) transition-colors hover:bg-white/[0.06]">
          Share work
        </button>
      </div>
    </header>
  );
}

function SceneHeader({ media }: { media: CityMedia }) {
  return (
    <section className="scene-header overflow-hidden rounded-[1.8rem] px-5 py-4 sm:px-7 sm:py-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(360px,1fr)_auto] xl:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.3em] text-(--muted-ivory)">
            <span className="live-beacon inline-block h-2 w-2 rounded-full bg-(--amber-glow)" />
            Live ecosystem / {media.country}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,3.2vw,3rem)] leading-none tracking-[0.02em] uppercase">
            {media.sceneTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--muted-ivory)">
            {media.cityStory}
          </p>
        </div>
        <CitySelector />
      </div>
    </section>
  );
}

function CityStatusStrip({ ecosystem }: { ecosystem: CityEcosystem }) {
  return (
    <div className="city-status-strip grid grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] p-1 sm:grid-cols-4">
      {ecosystem.livePulse.map((signal, index) => (
        <div key={signal.label} className="city-status-cell rounded-[1.2rem] px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em] text-(--muted-ivory)">{signal.label}</p>
            {index === 0 && <span className="live-beacon h-1.5 w-1.5 shrink-0 rounded-full bg-(--amber-glow)" />}
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-[0.04em] text-(--soft-ivory)">{signal.value}</p>
            <p className="truncate text-[0.68rem] text-(--muted-ivory)">{signal.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedSceneMoment({
  media,
  moment,
  ecosystem,
}: {
  media: CityMedia;
  moment: CulturalMoment;
  ecosystem: CityEcosystem;
}) {
  return (
    <article className="featured-moment order-1 relative overflow-hidden rounded-[1.8rem]">
      <div
        className="featured-cover absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(12, 12, 15, 0.08), rgba(12, 12, 15, 0.84)), url("${media.imageSrc}")`,
          backgroundPosition: media.focalPoint,
        }}
      />
      <div className="relative flex min-h-[295px] flex-col justify-between gap-10 p-5 sm:min-h-[330px] sm:p-6">
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
            <button className="featured-action" type="button">
              {moment.action}
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreativeMap({ ecosystem, media, reducedMotion }: {
  ecosystem: CityEcosystem;
  media: CityMedia;
  reducedMotion: boolean;
}) {
  const [activeNode, setActiveNode] = useState<number | null>(0);
  const pathPoints = ecosystem.mapNodes.map((node) => `${node.x},${node.y}`).join(" ");
  const selectedNode = activeNode === null ? null : ecosystem.mapNodes[activeNode];
  const ambientSignals = ecosystem.mapNodes.flatMap((node, index) => [
    {
      id: `${node.label}-north`,
      anchor: index,
      x: Math.max(9, Math.min(91, node.x + (index % 2 === 0 ? 13 : -11))),
      y: Math.max(11, node.y - 17 - (index % 2) * 4),
    },
    {
      id: `${node.label}-nearby`,
      anchor: index,
      x: Math.max(9, Math.min(91, node.x + (index % 2 === 0 ? -8 : 9))),
      y: Math.max(13, node.y - 8),
    },
  ]);

  return (
    <section className="map-panel creative-map-v2 order-2 relative min-h-[590px] overflow-hidden rounded-[2rem] p-5 sm:min-h-[635px] sm:p-7">
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader eyebrow="Creative map / primary view" title={`${media.city} is moving now`} action="Open full map" />
        <div className="mb-5 flex flex-wrap gap-2">
          <MapLegend state="live room" />
          <MapLegend state="open call" />
          <MapLegend state="starting soon" />
        </div>
      </div>
      <CityMediaLegend media={media} />
      <div className="map-surface absolute inset-x-3 bottom-3 top-[9.75rem] overflow-hidden rounded-[1.4rem] border border-white/[0.07] sm:inset-x-6 sm:bottom-6 sm:rounded-[1.65rem]">
        <div className="map-grid absolute inset-0" />
        <div className="map-haze absolute inset-0" />
        {ecosystem.mapNodes.map((node, index) => (
          <div
            key={`${node.label}-district`}
            className={`district-zone district-${index} ${activeNode === index ? "is-active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="district-name">{node.label}</span>
          </div>
        ))}
        <svg className="map-connections absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <motion.polyline
            className="map-primary-route"
            points={pathPoints}
            fill="none"
            stroke="var(--scene-primary)"
            strokeWidth="0.24"
            strokeDasharray="1.2 1.8"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0, strokeOpacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, strokeOpacity: activeNode === null ? 0.42 : 0.6 }}
            transition={{ duration: reducedMotion ? 0 : 1.45, ease: "easeInOut" }}
          />
          {ecosystem.mapNodes.slice(0, -1).map((node, index) => {
            const next = ecosystem.mapNodes[index + 1];

            return (
              <motion.line
                key={`${node.label}-${next.label}`}
                x1={node.x}
                y1={node.y}
                x2={next.x}
                y2={next.y}
                stroke="var(--scene-secondary)"
                strokeWidth="0.23"
                initial={reducedMotion ? false : { pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: activeNode === null ? 0.3 : activeNode === index || activeNode === index + 1 ? 0.74 : 0.1 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: activeNode === null ? index * 0.08 : 0 }}
              />
            );
          })}
          {ambientSignals.map((signal, index) => {
            const anchor = ecosystem.mapNodes[signal.anchor];
            const linked = activeNode === signal.anchor;

            return (
              <motion.line
                key={`${signal.id}-path`}
                x1={signal.x}
                y1={signal.y}
                x2={anchor.x}
                y2={anchor.y}
                stroke="var(--scene-primary)"
                strokeWidth="0.12"
                strokeDasharray="0.6 2"
                initial={reducedMotion ? false : { pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: linked ? 0.46 : 0.13 }}
                transition={{ duration: reducedMotion ? 0 : 0.7, delay: linked ? 0 : index * 0.04 }}
              />
            );
          })}
        </svg>
        {ambientSignals.map((signal, index) => (
          <motion.span
            key={signal.id}
            className={`ambient-signal absolute rounded-full ${activeNode === signal.anchor ? "is-linked" : ""}`}
            style={{ left: `${signal.x}%`, top: `${signal.y}%`, animationDelay: `${index * 320}ms` }}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.2 + index * 0.045, duration: reducedMotion ? 0 : 0.45 }}
          />
        ))}
        {ecosystem.mapNodes.map((node, index) => {
          const selected = activeNode === index;
          const nearby = activeNode !== null && Math.abs(activeNode - index) === 1;

          return (
          <motion.button
            key={node.label}
            type="button"
            aria-label={`${node.label}: ${mapStateLabel(node.state)}, ${discoveryHint(node.state)}`}
            className={`map-hotspot absolute text-left ${selected ? "is-active" : ""} ${nearby ? "is-nearby" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, delay: 0.18 + index * 0.09 }}
            onPointerEnter={() => setActiveNode(index)}
            onFocus={() => setActiveNode(index)}
            onClick={() => setActiveNode(index)}
          >
            <span className="density-ring density-ring-wide" />
            <span className="density-ring" />
            <span className="cluster-dot cluster-a" />
            <span className="cluster-dot cluster-b" />
            <span
              className={`signal-node node-${stateClass(node.state)} relative block rounded-full`}
              style={{
                height: `${12 + node.strength / 11}px`,
                width: `${12 + node.strength / 11}px`,
              }}
            />
            <div className={`map-preview-card ${node.x > 55 ? "map-preview-left" : ""}`}>
              <p className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.17em] text-(--muted-ivory)">
                <span className={`h-1.5 w-1.5 rounded-full node-${stateClass(node.state)}`} />
                {mapStateLabel(node.state)}
              </p>
              <p className="mt-1.5 text-sm font-medium text-(--soft-ivory)">{node.label}</p>
              <p className="mt-1 text-[0.68rem] text-(--muted-ivory)">
                {mapSignalType(node.state)} / {node.type}
              </p>
              <p className="mt-1 text-[0.67rem] text-(--soft-ivory)">{node.activity}</p>
              <p className="map-action mt-2 text-[0.63rem] uppercase tracking-[0.18em]">{discoveryHint(node.state)}</p>
            </div>
          </motion.button>
        );
        })}
        <div className="scene-ticker absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-full px-4 py-3 text-[0.68rem] text-(--muted-ivory) sm:inset-x-6">
          <span className="uppercase tracking-[0.22em] text-(--soft-ivory)">Scene transmission</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={selectedNode?.label ?? "city-scene"}
              className="truncate"
              initial={reducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reducedMotion ? 0 : 0.24 }}
            >
              {selectedNode
                ? `${selectedNode.label} / ${discoveryHint(selectedNode.state)} / ${selectedNode.activity}`
                : `${ecosystem.livePulse[2].detail} / ${ecosystem.audio.artist} is live in audio`}
            </motion.span>
          </AnimatePresence>
          <span className="scene-active hidden shrink-0 text-(--acid) sm:block">Scene active</span>
        </div>
      </div>
    </section>
  );
}

function CityMediaLegend({ media }: { media: CityMedia }) {
  return (
    <div className="media-legend relative z-10 mt-1 flex flex-wrap items-center gap-2.5 rounded-2xl px-3 py-2.5">
      <span className="mr-1 text-[0.61rem] uppercase tracking-[0.2em] text-(--muted-ivory)">Cinematic city layer</span>
      <span className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/[0.1] px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-(--amber-glow)" />
        <span className="text-[0.68rem] text-(--soft-ivory)">{media.mediaDescriptor}</span>
      </span>
      <span className="hidden text-[0.64rem] text-(--muted-ivory) lg:inline">
        {media.character} / {media.ambientParticles.label}
      </span>
    </div>
  );
}

type DisplayMapState = "live room" | "open call" | "starting soon";

function MapLegend({ state }: { state: DisplayMapState }) {
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-white/8 bg-black/15 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-(--muted-ivory) sm:flex">
      <span className={`h-1.5 w-1.5 rounded-full node-${stateClass(state)}`} />
      {state}
    </span>
  );
}

function stateClass(state: ActivityState | DisplayMapState) {
  return state.replaceAll(" ", "-");
}

function mapStateLabel(state: ActivityState): DisplayMapState | "listening room" {
  if (state === "live now") {
    return "live room";
  }

  if (state === "studio open") {
    return "starting soon";
  }

  return state;
}

function mapSignalType(state: ActivityState) {
  return state === "open call" ? "Opportunity" : "Event";
}

function discoveryHint(state: ActivityState) {
  if (state === "open call") {
    return "Open collaboration";
  }

  if (state === "studio open") {
    return "2 nearby artists";
  }

  return state === "live now" ? "Explore room" : "Live now";
}

function LivingActivityFeed({ activities }: { activities: AmbientActivity[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <GlassPanel className="activity-panel order-3 overflow-hidden p-4 sm:p-5">
      <SectionHeader eyebrow="Living activity" title="Scene transmissions" action="See all" />
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <motion.div
            key={`${activity.actor}-${activity.action}`}
            className="activity-item flex gap-3 rounded-2xl px-3 py-3"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : index * 0.09, duration: reducedMotion ? 0 : 0.38 }}
          >
            <span className={`activity-mark activity-${activity.kind} mt-1.5 block h-2 w-2 shrink-0 rounded-full`} />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="activity-category rounded-full px-2 py-1 text-[0.57rem] uppercase tracking-[0.17em]">
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
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-(--muted-ivory)">
                {activity.place}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
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
    <GlassPanel className="practice-strip order-5 p-4 sm:p-5">
      <SectionHeader eyebrow="For your practice" title="Matched signals" action="Tune" />
      <div className="practice-signals mt-4 grid gap-3 sm:grid-cols-3">
        {ecosystem.matchedSignals.map((signal, index) => (
          <CinematicCard key={signal.label} breathe={index === 0} className="practice-signal flex min-w-0 items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-(--soft-ivory)">{signal.label}</p>
              <p className="mt-1 truncate text-xs text-(--muted-ivory)">{signal.detail}</p>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-(--acid)">{signal.confidence}</p>
            </div>
            <span className={`h-2 w-2 shrink-0 rounded-full ${index === 0 ? "live-beacon bg-(--amber-glow)" : "bg-white/25"}`} />
          </CinematicCard>
        ))}
      </div>
    </GlassPanel>
  );
}

function TonightMovement({ ecosystem, media }: { ecosystem: CityEcosystem; media: CityMedia }) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="movement-panel order-4 self-start rounded-[1.65rem] p-5 sm:p-6">
      <SectionHeader eyebrow="Tonight" title="Cultural movement" action="See all" />
      <div className="movement-gallery mt-5 grid gap-4 md:grid-cols-3">
        {ecosystem.tonight.map((moment, index) => (
          <motion.article
            key={moment.title}
            className={`movement-card movement-card-${index} overflow-hidden rounded-[1.25rem]`}
            whileHover={reducedMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <div
              className="movement-cover relative min-h-[8.3rem] p-3"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(12, 12, 15, 0.04), rgba(12, 12, 15, 0.7)), url("${media.imageSrc}")`,
                backgroundPosition: `${media.focalPoint.split(" ")[0]} ${index === 0 ? "35%" : index === 1 ? "52%" : "68%"}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="movement-badge">{moment.format}</span>
                <span className="text-[0.68rem] text-(--soft-ivory)/72">{moment.time}</span>
              </div>
              {moment.audio ? <MiniWaveform /> : null}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.63rem] uppercase tracking-[0.2em] text-(--muted-ivory)">{moment.kind}</span>
                <span className="text-[0.63rem] uppercase tracking-[0.2em] text-(--acid)">{moment.place}</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl leading-snug text-(--soft-ivory)">
                {moment.title}
              </h3>
              <p className="mt-2 text-sm text-(--muted-ivory)">{moment.mood}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <AvatarStack artists={moment.artists} />
                <button className="movement-action" type="button">{moment.action}</button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function OpportunityLayer({ ecosystem }: { ecosystem: CityEcosystem }) {
  return (
    <GlassPanel className="opportunity-panel order-6 p-6">
      <SectionHeader eyebrow="Opportunity layer" title="Ways into the scene" />
      <div className="space-y-4">
        {ecosystem.opportunities.map((opportunity) => (
          <div key={opportunity.title} className="border-b border-white/8 pb-4 last:border-0 last:pb-0">
            <p className="text-sm text-(--soft-ivory)">{opportunity.title}</p>
            <p className="mt-2 text-xs text-(--muted-ivory)">
              {opportunity.creator} / {opportunity.need}
            </p>
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.21em] text-(--acid)">
              <span className="opportunity-badge">{opportunity.deadline}</span>
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
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

function MiniWaveform() {
  return (
    <div className="mini-waveform" aria-hidden="true">
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

function AudioPreview({ ecosystem }: { ecosystem: CityEcosystem }) {
  const heights = [35, 62, 42, 78, 56, 93, 51, 74, 42, 66, 38, 58, 29];

  return (
    <GlassPanel className="audio-presence order-7 overflow-hidden p-6">
      <SectionHeader eyebrow="Immersive audio / live" title={ecosystem.audio.title} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-(--soft-ivory)">{ecosystem.audio.artist}</p>
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-(--muted-ivory)">
          <span className="audio-live-dot h-1.5 w-1.5 rounded-full" />
          Listening room live
        </span>
      </div>
      <p className="mt-2 text-xs text-(--muted-ivory)">{ecosystem.audio.context}</p>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          aria-label={`Play ${ecosystem.audio.title}`}
          className="audio-control relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-(--graphite) shadow-[0_0_27px_color-mix(in_srgb,var(--acid)_50%,transparent)]"
        >
          <span className="ml-0.5 text-sm" aria-hidden="true">&#9654;</span>
        </button>
        <div className="flex h-10 flex-1 items-end gap-[3px]" aria-hidden="true">
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
