"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import type { CityMedia } from "@/lib/city-media";
import type { ActivityState, CityEcosystem } from "@/lib/mock-data";
import styles from "./map.module.css";

type DisplayMapState = "live room" | "open call" | "starting soon";
type MapTone = "artists" | "events" | "collectives" | "spaces" | "live-rooms";

const HP_CANVAS_DOTS: ReadonlyArray<{ x: number; y: number; tone: MapTone }> = [
  // Curated field lights, grouped around the same districts as the hubs.
  { x: 10, y: 29, tone: "events"      },
  { x: 15, y: 22, tone: "artists"     },
  { x: 25, y: 42, tone: "live-rooms"  },
  { x: 30, y: 31, tone: "events"      },
  { x: 43, y: 45, tone: "spaces"      },
  { x: 49, y: 60, tone: "collectives" },
  { x: 61, y: 38, tone: "events"      },
  { x: 65, y: 63, tone: "artists"     },
  { x: 72, y: 45, tone: "collectives" },
  { x: 79, y: 24, tone: "spaces"      },
  { x: 83, y: 35, tone: "live-rooms"  },
  { x: 88, y: 18, tone: "artists"     },
  { x: 22, y: 70, tone: "spaces"      },
  { x: 34, y: 78, tone: "collectives" },
  { x: 48, y: 74, tone: "live-rooms"  },
  { x: 58, y: 80, tone: "artists"     },
  { x: 76, y: 72, tone: "events"      },
  { x: 90, y: 66, tone: "collectives" },
];

function routeToneClass(tone: string): string {
  const map: Record<string, string> = {
    events:       styles.toneEvents,
    collectives:  styles.toneCollectives,
    spaces:       styles.toneSpaces,
    artists:      styles.toneArtists,
    "live-rooms": styles.toneLiveRooms,
    audio:        styles.toneAudio,
    match:        styles.toneMatch,
  };
  return map[tone] ?? styles.toneEvents;
}

function hubLinkClass(tone: string): string {
  const map: Record<string, string> = {
    events:       styles.hubLinkEvents,
    collectives:  styles.hubLinkCollectives,
    spaces:       styles.hubLinkSpaces,
    artists:      styles.hubLinkArtists,
    "live-rooms": styles.hubLinkLiveRooms,
  };
  return map[tone] ?? styles.hubLinkEvents;
}

function scatterDotToneClass(tone: MapTone): string {
  const map: Record<MapTone, string> = {
    events:       styles.scatterDotEvents,
    collectives:  styles.scatterDotCollectives,
    spaces:       styles.scatterDotSpaces,
    artists:      styles.scatterDotArtists,
    "live-rooms": styles.scatterDotLiveRooms,
  };
  return map[tone];
}

function nodeColorClassForDisplay(state: DisplayMapState): string {
  if (state === "live room")    return styles.nodeLiveRoom;
  if (state === "open call")    return styles.nodeOpenCall;
  return styles.nodeStartingSoon;
}

function activityNodeClass(state: ActivityState): string {
  if (state === "live now")       return styles.nodeLiveNow;
  if (state === "open call")      return styles.nodeOpenCall;
  if (state === "studio open")    return styles.nodeStudioOpen;
  if (state === "listening room") return styles.nodeListeningRoom;
  return styles.nodeLiveNow;
}

function legendDotClass(tone: MapTone): string {
  const map: Record<MapTone, string> = {
    artists:      styles.legendDotArtists,
    events:       styles.legendDotEvents,
    collectives:  styles.legendDotCollectives,
    spaces:       styles.legendDotSpaces,
    "live-rooms": styles.legendDotLiveRooms,
  };
  return map[tone];
}

function districtIndexClass(index: number): string {
  if (index === 1) return styles.district1;
  if (index === 2) return styles.district2;
  return "";
}

function mapStateLabel(state: ActivityState): DisplayMapState | "listening room" {
  if (state === "live now") return "live room";
  if (state === "studio open") return "starting soon";
  return state;
}

function mapSignalType(state: ActivityState) {
  return state === "open call" ? "Opportunity" : "Event";
}

function discoveryHint(state: ActivityState) {
  if (state === "open call") return "Open collaboration";
  if (state === "studio open") return "2 nearby artists";
  return state === "live now" ? "Explore room" : "Live now";
}

function MapStatus({ state }: { state: DisplayMapState }) {
  return (
    <span className={styles.mapStateBadge}>
      <span className={`h-1.5 w-1.5 rounded-full ${nodeColorClassForDisplay(state)}`} />
      {state}
    </span>
  );
}

function MapLegend({ tone }: { tone: MapTone }) {
  return (
    <span className={styles.mapLegendItem}>
      <span className={`${styles.mapLegendDot} ${legendDotClass(tone)}`} />
      {tone.replace("-", " ")}
    </span>
  );
}

export function CreativeMapPreview({ ecosystem, media, reducedMotion }: {
  ecosystem: CityEcosystem;
  media: CityMedia;
  reducedMotion: boolean;
}) {
  const [activeNode, setActiveNode] = useState<number | null>(0);
  const selectedNode = activeNode === null ? null : ecosystem.mapNodes[activeNode];

  const nodes = ecosystem.mapNodes;
  const n0 = nodes[0];
  const n1 = nodes[1] ?? nodes[0];
  const n2 = nodes[2] ?? nodes[0];
  const has4Nodes = nodes.length >= 4;
  const n3 = has4Nodes ? nodes[3] : null;

  const networkTones = ["artists", "events", "collectives", "spaces", "live-rooms"] as const;

  // Primary spine: San Lorenzo → Ostiense → Pigneto, kept elegant for preview scale.
  const spinePath = `M ${n0.x} ${n0.y} C ${n0.x + 13} ${n0.y - 9}, ${n1.x - 11} ${n1.y - 8}, ${n1.x} ${n1.y} C ${n1.x + 8} ${n1.y - 12}, ${n2.x - 7} ${n2.y + 8}, ${n2.x} ${n2.y}`;
  const southPath = n3
    ? `M ${n3.x} ${n3.y} C ${n3.x + 12} ${n3.y - 8}, ${n1.x - 13} ${n1.y + 10}, ${n1.x} ${n1.y}`
    : `M ${n2.x} ${n2.y} C ${n2.x - 14} ${n2.y + 16}, ${n1.x + 11} ${n1.y + 12}, ${n1.x} ${n1.y}`;
  const westPath = n3
    ? `M ${n0.x} ${n0.y} C ${n0.x + 4} ${n0.y + 14}, ${n3.x - 8} ${n3.y - 11}, ${n3.x} ${n3.y}`
    : `M ${n0.x} ${n0.y} C ${n0.x + 7} ${n0.y + 20}, ${n1.x - 19} ${n1.y + 14}, ${n1.x} ${n1.y}`;
  const eastDiagPath = n3
    ? `M ${n2.x} ${n2.y} C ${n2.x - 4} ${n2.y + 15}, ${n1.x + 10} ${n1.y - 8}, ${n1.x} ${n1.y}`
    : `M ${n2.x} ${n2.y} C ${n2.x + 5} ${n2.y + 12}, ${n1.x + 12} ${n1.y - 8}, ${n1.x} ${n1.y}`;

  const previewRoutes = [
    { id: "cultural-spine", tone: "events"      as const, weight: "primary"   as const, d: spinePath },
    { id: "southern-arc",   tone: "spaces"      as const, weight: "secondary" as const, d: southPath },
    { id: "western-link",   tone: "collectives" as const, weight: "secondary" as const, d: westPath },
    { id: "east-diagonal",  tone: "artists"     as const, weight: "secondary" as const, d: eastDiagPath },
  ] as const;

  const atmosphericTraces = [
    { id: "left-cluster-trace", tone: "events" as const, d: `M ${n0.x - 15} ${n0.y + 8} C ${n0.x - 3} ${n0.y - 12}, ${n0.x + 19} ${n0.y - 8}, ${n1.x - 4} ${n1.y - 1}` },
    { id: "right-cluster-trace", tone: "spaces" as const, d: `M ${n1.x + 1} ${n1.y - 6} C ${n1.x + 17} ${n1.y - 24}, ${n2.x + 21} ${n2.y - 11}, ${n2.x + 16} ${n2.y + 15}` },
    { id: "lower-cluster-trace", tone: "collectives" as const, d: n3 ? `M ${n3.x - 12} ${n3.y + 9} C ${n3.x + 4} ${n3.y - 11}, ${n1.x - 12} ${n1.y + 14}, ${n1.x + 7} ${n1.y + 12}` : southPath },
  ] as const;

  // Hub-local satellite signals — 5 per n0, 5 per n1, 4 per n2, 4 per n3
  const hubSignals: { id: string; ai: number; xOff: number; yOff: number; tone: MapTone }[] = [
    { id: "s0a", ai: 0, xOff:  -9, yOff:  -7, tone: "events"      },
    { id: "s0b", ai: 0, xOff:  10, yOff:  -5, tone: "artists"     },
    { id: "s0c", ai: 0, xOff:  -5, yOff:   9, tone: "live-rooms"  },
    { id: "s0d", ai: 0, xOff:   7, yOff:  -9, tone: "collectives" },
    { id: "s0e", ai: 0, xOff: -11, yOff:   5, tone: "spaces"      },
    { id: "s1a", ai: 1, xOff: -11, yOff:  -6, tone: "events"      },
    { id: "s1b", ai: 1, xOff:   9, yOff:  -8, tone: "collectives" },
    { id: "s1c", ai: 1, xOff:  11, yOff:   6, tone: "spaces"      },
    { id: "s1d", ai: 1, xOff:  -8, yOff:   9, tone: "artists"     },
    { id: "s1e", ai: 1, xOff:   6, yOff:  11, tone: "live-rooms"  },
    { id: "s2a", ai: 2, xOff: -10, yOff:   5, tone: "live-rooms"  },
    { id: "s2b", ai: 2, xOff:  -6, yOff:  -8, tone: "artists"     },
    { id: "s2c", ai: 2, xOff:   8, yOff:   5, tone: "events"      },
    { id: "s2d", ai: 2, xOff:  10, yOff:  -6, tone: "collectives" },
    ...(has4Nodes
      ? ([
          { id: "s3a", ai: 3, xOff:   9, yOff:  -6, tone: "spaces"      as const },
          { id: "s3b", ai: 3, xOff:  -7, yOff:  -7, tone: "collectives" as const },
          { id: "s3c", ai: 3, xOff: -10, yOff:   5, tone: "events"      as const },
          { id: "s3d", ai: 3, xOff:   6, yOff:   8, tone: "live-rooms"  as const },
        ] as const)
      : []),
  ];

  const ambientSignals = hubSignals.map((s) => {
    const anchor = nodes[s.ai] ?? n0;
    return {
      id: s.id,
      anchor: s.ai,
      tone: s.tone,
      x: Math.max(5, Math.min(95, anchor.x + s.xOff)),
      y: Math.max(7, Math.min(90, anchor.y + s.yOff)),
    };
  });

  return (
    <section className={`${styles.mapPreview} relative min-h-[640px] rounded-[2rem] p-5 sm:min-h-[735px] sm:p-7 xl:min-h-[820px]`}>
      <div className="relative z-10">
        <SectionHeader eyebrow="Preview live ecosystem" title={`${media.city} is moving now`} action="Open live map" actionHref="/creative-map" actionTone="map" />
      </div>
      <p className={styles.mapPurpose}>Navigate live rooms, open calls and active districts across the cultural city layer.</p>
      <div className={styles.mapOverflowAtmosphere} aria-hidden="true">
        <span className={styles.mapOverflowRoute} />
        <span className={styles.mapOverflowPulse} />
      </div>
      <div className={`${styles.mapSurface} absolute inset-x-3 bottom-3 top-[9.75rem] overflow-hidden rounded-[1.4rem] sm:inset-x-6 sm:bottom-6 sm:rounded-[1.65rem]`}>
        <div
          className={`${styles.mapCityLayer} absolute inset-0`}
          style={{ backgroundImage: `url("${media.imageSrc}")`, backgroundPosition: media.focalPoint }}
        />
        <div className={`${styles.mapVolume} absolute inset-0`} />
        <div className={`${styles.mapDepthHorizon} absolute inset-0`} />
        <div className={`${styles.mapFloor} absolute inset-0`} />
        <div className={`${styles.mapTopology} absolute inset-0`} />
        <div className={`${styles.mapGrid} absolute inset-0`} />
        <div className={`${styles.mapHaze} absolute inset-0`} />
        <div className={`${styles.mapTransientLight} absolute inset-0`} />
        <div className={`${styles.mapForegroundLight} absolute inset-0`} />
        <div className={`${styles.mapSpatialFog} absolute inset-0`} />
        <div
          className={`${styles.mapFocusBloom} absolute inset-0`}
          style={selectedNode
            ? { "--focus-x": `${selectedNode.x}%`, "--focus-y": `${selectedNode.y}%` } as CSSProperties
            : undefined}
        />
        {nodes.map((node, index) => (
          <span
            key={`${node.label}-aura`}
            className={`${styles.previewClusterAura} ${index === 0 ? styles.previewAuraPrimary : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          />
        ))}
        <div className={styles.mapStatusPills}>
          <MapStatus state="live room" />
          <MapStatus state="open call" />
          <MapStatus state="starting soon" />
        </div>
        {ecosystem.mapNodes.map((node, index) => (
          <div
            key={`${node.label}-district`}
            className={[
              styles.districtZone,
              districtIndexClass(index),
              activeNode === index ? styles.isActive : "",
            ].filter(Boolean).join(" ")}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className={styles.districtName}>{node.label}</span>
          </div>
        ))}
        <svg
          className={`${styles.mapConnections} absolute inset-0 h-full w-full`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {atmosphericTraces.map((trace) => (
            <path
              key={trace.id}
              className={[styles.atmosphericTrace, routeToneClass(trace.tone)].join(" ")}
              d={trace.d}
            />
          ))}
          {ambientSignals.map((signal, index) => {
            const anchor = nodes[signal.anchor];
            const linked = activeNode === signal.anchor;
            return (
              <motion.line
                key={`${signal.id}-path`}
                className={[styles.hubLink, hubLinkClass(signal.tone)].join(" ")}
                x1={signal.x}
                y1={signal.y}
                x2={anchor.x}
                y2={anchor.y}
                initial={reducedMotion ? false : { pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: linked ? 0.48 : 0.18 }}
                transition={{ duration: reducedMotion ? 0 : 0.7, delay: linked ? 0 : index * 0.04 }}
              />
            );
          })}
          <path className={styles.routeDepth} d={previewRoutes[0].d} />
          {previewRoutes.map((route, index) => (
            <motion.path
              key={route.id}
              className={[
                styles.route,
                route.weight === "primary" ? styles.routePrimary : styles.routeSecondary,
                routeToneClass(route.tone),
              ].join(" ")}
              d={route.d}
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                strokeOpacity: route.weight === "primary"
                  ? (activeNode === null ? 0.72 : 0.88)
                  : activeNode === null ? 0.40 : 0.55,
              }}
              transition={{ duration: reducedMotion ? 0 : 1.1, delay: reducedMotion ? 0 : index * 0.08, ease: "easeInOut" }}
            />
          ))}
          <path className={styles.pulsePrimary} d={previewRoutes[0].d} />
          <path className={styles.pulseSecondary} d={previewRoutes[1].d} />
          <path className={styles.pulseSecondary} d={previewRoutes[2].d} />
          <path className={styles.pulseSecondary} d={previewRoutes[3].d} />
        </svg>
        {ambientSignals.map((signal, index) => (
          <span
            key={signal.id}
            className={[styles.scatterDot, styles.hubScatterDot, scatterDotToneClass(signal.tone)].join(" ")}
            style={{ left: `${signal.x}%`, top: `${signal.y}%`, animationDelay: `${index * 320}ms` }}
          />
        ))}
        {HP_CANVAS_DOTS.map((dot, i) => (
          <span
            key={`cs-${i}`}
            className={[styles.scatterDot, styles.fieldDot, scatterDotToneClass(dot.tone)].join(" ")}
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, animationDelay: `${(i * 240) % 3200}ms` }}
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
              className={[
                styles.mapHotspot,
                "absolute text-left",
                selected ? styles.isActive : "",
                nearby ? styles.isNearby : "",
                index === 0 ? styles.isFocusHub : "",
                node.strength >= 78 ? styles.isMajor : node.strength < 60 ? styles.isSubtle : "",
              ].filter(Boolean).join(" ")}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.45, delay: 0.18 + index * 0.09 }}
              onPointerEnter={() => setActiveNode(index)}
              onFocus={() => setActiveNode(index)}
              onClick={() => setActiveNode(index)}
            >
              <span className={`${styles.densityRing} ${styles.densityRingWide}`} />
              <span className={styles.densityRing} />
              <span className={`${styles.districtOrbit} ${styles.districtOrbitHalo}`}><span /></span>
              <span className={`${styles.districtOrbit} ${styles.districtOrbitOuter}`}><span /></span>
              <span className={`${styles.districtOrbit} ${styles.districtOrbitInner}`}><span /></span>
              <span className={`${styles.clusterDot} ${styles.clusterA}`} />
              <span className={`${styles.clusterDot} ${styles.clusterB}`} />
              <span
                className={`${styles.signalNode} ${activityNodeClass(node.state)} relative block rounded-full`}
                style={{ height: `${10 + node.strength / 8}px`, width: `${10 + node.strength / 8}px` }}
              />
              <div className={`${styles.mapPreviewCard} ${node.x > 55 ? styles.mapPreviewLeft : ""}`}>
                <p className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.17em] text-(--muted-ivory)">
                  <span className={`h-1.5 w-1.5 rounded-full ${activityNodeClass(node.state)}`} />
                  {mapStateLabel(node.state)}
                </p>
                <p className="mt-1.5 text-sm font-medium text-(--soft-ivory)">{node.label}</p>
                <p className="mt-1 text-[0.68rem] text-(--muted-ivory)">
                  {mapSignalType(node.state)} / {node.type}
                </p>
                <p className="mt-1 text-[0.67rem] text-(--soft-ivory)">{node.activity}</p>
                <p className={`${styles.mapAction} mt-2 text-[0.63rem] uppercase tracking-[0.18em]`}>{discoveryHint(node.state)}</p>
              </div>
            </motion.button>
          );
        })}
        <nav className={styles.mapControls} aria-label="Creative map controls">
          <button type="button" aria-label="Zoom in">+</button>
          <button type="button" aria-label="Zoom out">&minus;</button>
          <button type="button" aria-label="Center active district">&#8599;</button>
        </nav>
        <div className={styles.mapEcosystemLegend} aria-label="Map ecosystem legend">
          {networkTones.map((tone) => <MapLegend key={tone} tone={tone} />)}
        </div>
        <div className={`${styles.sceneTicker} absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-full px-4 py-3 text-[0.68rem] text-(--muted-ivory) sm:inset-x-6`}>
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
          <span className={`${styles.sceneActive} hidden shrink-0 text-(--acid) sm:block`}>Scene active</span>
        </div>
      </div>
    </section>
  );
}
