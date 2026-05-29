import type { CSSProperties } from "react";
import { CitySelector } from "@/components/city-media/city-selector";
import { MOCK_ECOSYSTEM } from "@/lib/mock-data";
import styles from "./map.module.css";

type Tone = "artists" | "events" | "collectives" | "audio" | "spaces" | "match" | "opportunities" | "neutral";

// 11 satellite offsets per hub → 11 × 10 hubs = 110 satellites
const SAT_OFFSETS: ReadonlyArray<{ angleDeg: number; r: number }> = [
  { angleDeg:  15, r:  8 },
  { angleDeg:  50, r: 13 },
  { angleDeg:  95, r: 12 },
  { angleDeg: 130, r:  7 },
  { angleDeg: 155, r:  9 },
  { angleDeg: 192, r: 14 },
  { angleDeg: 210, r: 11 },
  { angleDeg: 248, r:  8 },
  { angleDeg: 272, r: 13 },
  { angleDeg: 305, r: 10 },
  { angleDeg: 334, r:  9 },
];

function toneColor(tone: string): string {
  const map: Record<string, string> = {
    events:        "var(--rose)",
    collectives:   "var(--collective)",
    spaces:        "var(--teal)",
    artists:       "var(--violet-soft)",
    "live-rooms":  "#8664ff",
    audio:         "var(--teal)",
    match:         "var(--violet-soft)",
    opportunities: "var(--rose)",
    neutral:       "var(--violet-soft)",
  };
  return map[tone] ?? "var(--rose)";
}

function fullRouteToneClass(tone: string): string {
  const map: Record<string, string> = {
    events:       styles.toneEvents,
    collectives:  styles.toneCollectives,
    spaces:       styles.toneSpaces,
    artists:      styles.toneArtists,
    "live-rooms": styles.toneLiveRooms,
    audio:        styles.toneAudio,
    match:        styles.toneMatch,
    opportunities: styles.toneEvents,
    neutral:      styles.toneArtists,
  };
  return map[tone] ?? styles.toneEvents;
}

function fullPulseDurationClass(tone: string): string {
  const map: Record<string, string> = {
    events:      styles.fullPulseEvents,
    collectives: styles.fullPulseCollectives,
    audio:       styles.fullPulseAudio,
    artists:     styles.fullPulseArtists,
  };
  return map[tone] ?? "";
}

function scatterToneClass(tone: string): string {
  if (tone === "events" || tone === "opportunities") return styles.scatterDotEvents;
  if (tone === "collectives") return styles.scatterDotCollectives;
  if (tone === "spaces") return styles.scatterDotSpaces;
  if (tone === "audio") return styles.scatterDotSpaces;
  return styles.scatterDotArtists;
}

function FilterPills({ items }: { items: string[] }) {
  return (
    <div className={styles.filterPills}>
      {items.map((item, index) => (
        <button
          key={item}
          className={[styles.filterPillsButton, index === 0 ? styles.filterPillsButtonActive : ""].filter(Boolean).join(" ")}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function CreativeMapFull({ cityImage, ecosystem }: {
  cityImage: string;
  ecosystem: typeof MOCK_ECOSYSTEM.rome;
}) {
  const baseTones = ["events", "opportunities", "audio", "spaces"] as const;

  const expandedNodes = [
    ...ecosystem.mapNodes.map((node, index) => ({ ...node, tone: (baseTones[index] ?? "neutral") as Tone })),
    { label: "Centro Storico", activity: "Cultural route",   x: 47, y: 40, tone: "artists"     as Tone },
    { label: "Testaccio",      activity: "Open call",        x: 62, y: 65, tone: "collectives" as Tone },
    { label: "Garbatella",     activity: "Studio open",      x: 74, y: 55, tone: "spaces"      as Tone },
    { label: "Monti",          activity: "Exhibition trail", x: 32, y: 26, tone: "match"       as Tone },
    { label: "Torpignattara",  activity: "Listening cell",   x: 84, y: 40, tone: "audio"       as Tone },
    { label: "Prati",          activity: "Artist cluster",   x: 23, y: 57, tone: "artists"     as Tone },
  ];

  const [eN0, eN1, eN2, eN3, eN4, eN5, eN6, eN7, eN8, eN9] = expandedNodes;

  const fullMapPrimaryRoutes = [
    {
      id: "left-center-spine",
      tone: "events",
      d: `M ${eN0.x} ${eN0.y} C 28 30, 38 35, ${eN4.x} ${eN4.y} C 51 44, 54 49, ${eN1.x} ${eN1.y}`,
    },
    {
      id: "center-right-spine",
      tone: "audio",
      d: `M ${eN1.x} ${eN1.y} C 64 47, 69 43, ${eN2.x} ${eN2.y} C 76 38, 81 39, ${eN8.x} ${eN8.y}`,
    },
    {
      id: "right-studio-thread",
      tone: "spaces",
      d: `M ${eN2.x} ${eN2.y} C 75 36, 77 47, ${eN6.x} ${eN6.y} C 70 59, 66 63, ${eN5.x} ${eN5.y}`,
    },
    {
      id: "left-south-route",
      tone: "collectives",
      d: `M ${eN9.x} ${eN9.y} C 27 62, 31 67, ${eN3.x} ${eN3.y} C 43 70, 53 67, ${eN5.x} ${eN5.y}`,
    },
    {
      id: "artist-inner-loop",
      tone: "artists",
      d: `M ${eN7.x} ${eN7.y} C 38 30, 43 35, ${eN4.x} ${eN4.y} C 42 47, 32 50, ${eN9.x} ${eN9.y}`,
    },
    {
      id: "central-south-link",
      tone: "collectives",
      d: `M ${eN4.x} ${eN4.y} C 54 48, 59 58, ${eN5.x} ${eN5.y} C 67 61, 70 58, ${eN6.x} ${eN6.y}`,
    },
  ];

  const secondaryRoutes = [
    { id: "sl-monti",    tone: "match",       d: `M ${eN0.x} ${eN0.y} C 23 30, 28 28, ${eN7.x} ${eN7.y}` },
    { id: "sl-prati",    tone: "events",      d: `M ${eN0.x} ${eN0.y} C 19 43, 21 51, ${eN9.x} ${eN9.y}` },
    { id: "sl-centro",   tone: "artists",     d: `M ${eN0.x} ${eN0.y} C 28 34, 38 37, ${eN4.x} ${eN4.y}` },
    { id: "centro-test", tone: "collectives", d: `M ${eN4.x} ${eN4.y} C 51 49, 56 58, ${eN5.x} ${eN5.y}` },
    { id: "os-torpig",   tone: "audio",       d: `M ${eN1.x} ${eN1.y} C 67 47, 76 44, ${eN8.x} ${eN8.y}` },
    { id: "pig-garb",    tone: "audio",       d: `M ${eN2.x} ${eN2.y} C 74 37, 74 46, ${eN6.x} ${eN6.y}` },
    { id: "prati-trast", tone: "spaces",      d: `M ${eN9.x} ${eN9.y} C 26 63, 31 67, ${eN3.x} ${eN3.y}` },
    { id: "monti-pig",   tone: "match",       d: `M ${eN7.x} ${eN7.y} C 45 20, 60 21, ${eN2.x} ${eN2.y}` },
    // New cluster connectors
    { id: "monti-centro",  tone: "artists",     d: `M ${eN7.x} ${eN7.y} C 36 30, 42 34, ${eN4.x} ${eN4.y}` },
    { id: "test-garb",     tone: "spaces",      d: `M ${eN5.x} ${eN5.y} C 66 62, 70 58, ${eN6.x} ${eN6.y}` },
    { id: "trast-test",    tone: "collectives", d: `M ${eN3.x} ${eN3.y} C 44 71, 55 67, ${eN5.x} ${eN5.y}` },
    { id: "prati-centro",  tone: "audio",       d: `M ${eN9.x} ${eN9.y} C 30 52, 40 46, ${eN4.x} ${eN4.y}` },
    { id: "torpig-garb",   tone: "events",      d: `M ${eN8.x} ${eN8.y} C 82 44, 78 50, ${eN6.x} ${eN6.y}` },
    { id: "os-centro",     tone: "match",       d: `M ${eN1.x} ${eN1.y} C 54 49, 51 45, ${eN4.x} ${eN4.y}` },
  ];

  const topologyCurves = [
    { id: "left-field-a", tone: "events", d: `M 10 43 C 19 27, 36 28, 48 40` },
    { id: "left-field-b", tone: "artists", d: `M 17 65 C 23 51, 32 46, 47 41` },
    { id: "center-field-a", tone: "collectives", d: `M 42 26 C 54 39, 58 52, 62 66` },
    { id: "center-field-b", tone: "match", d: `M 35 56 C 48 48, 60 49, 76 55` },
    { id: "right-field-a", tone: "audio", d: `M 65 31 C 73 27, 86 29, 92 42` },
    { id: "right-field-b", tone: "spaces", d: `M 68 65 C 77 54, 87 48, 92 34` },
    { id: "south-field-a", tone: "collectives", d: `M 24 78 C 43 82, 60 76, 76 64` },
    { id: "south-field-b", tone: "events", d: `M 21 36 C 39 49, 59 61, 83 70` },
    { id: "city-field-a", tone: "artists", d: `M 9 22 C 31 18, 58 18, 86 24` },
    { id: "city-field-b", tone: "audio", d: `M 8 85 C 33 71, 60 85, 94 74` },
  ];

  const clusterFields = [
    { id: "left", x: 24, y: 45, tone: "events", size: "29rem", height: "20rem" },
    { id: "central", x: 53, y: 52, tone: "collectives", size: "31rem", height: "22rem" },
    { id: "right", x: 78, y: 43, tone: "audio", size: "30rem", height: "21rem" },
  ];

  // 30 hub-local micro signals (3 per hub)
  const microSignalDefs: { n: number; xOff: number; yOff: number }[] = [
    { n: 0, xOff: -7, yOff: -7 }, { n: 0, xOff:  8, yOff:  6 }, { n: 0, xOff: -4, yOff: 10 },
    { n: 1, xOff: -8, yOff: -7 }, { n: 1, xOff:  9, yOff:  6 }, { n: 1, xOff:  5, yOff: -9 },
    { n: 2, xOff: -8, yOff:  6 }, { n: 2, xOff:  7, yOff: -7 }, { n: 2, xOff: -3, yOff: -9 },
    { n: 3, xOff:  8, yOff: -6 }, { n: 3, xOff: -7, yOff:  6 }, { n: 3, xOff: 10, yOff:  3 },
    { n: 4, xOff: -7, yOff: -6 }, { n: 4, xOff:  6, yOff:  7 }, { n: 4, xOff: -9, yOff:  4 },
    { n: 5, xOff: -6, yOff: -5 }, { n: 5, xOff:  7, yOff:  5 }, { n: 5, xOff:  4, yOff: -8 },
    { n: 6, xOff: -7, yOff: -5 }, { n: 6, xOff:  6, yOff:  6 }, { n: 6, xOff:  8, yOff: -5 },
    { n: 7, xOff:  7, yOff:  5 }, { n: 7, xOff: -7, yOff: -5 }, { n: 7, xOff:  3, yOff:  9 },
    { n: 8, xOff: -8, yOff:  5 }, { n: 8, xOff: -6, yOff: -7 }, { n: 8, xOff:  9, yOff: -3 },
    { n: 9, xOff:  7, yOff: -6 }, { n: 9, xOff: -7, yOff:  6 }, { n: 9, xOff: -4, yOff: -8 },
  ];
  const microSignals = microSignalDefs.map(({ n, xOff, yOff }, i) => ({
    id: `ms-${i}`,
    nodeIndex: n,
    tone: expandedNodes[n].tone,
    x: Math.max(7, Math.min(93, expandedNodes[n].x + xOff)),
    y: Math.max(8, Math.min(88, expandedNodes[n].y + yOff)),
  }));

  // 110 structured satellites (11 × 10 hubs)
  const canvasScatter = expandedNodes.flatMap((node, ni) =>
    SAT_OFFSETS.map(({ angleDeg, r }, si) => {
      const rad = (angleDeg * Math.PI) / 180;
      return {
        id: `sat-${ni}-${si}`,
        tone: node.tone,
        x: Math.max(5, Math.min(95, node.x + Math.cos(rad) * r)),
        y: Math.max(5, Math.min(92, node.y + Math.sin(rad) * r)),
      };
    })
  );

  return (
    <section className={styles.fullMapStage}>
      <div className={styles.fullMapToolbar}>
        <CitySelector />
        <FilterPills items={["Artists", "Events", "Collectives", "Spaces", "Live rooms"]} />
      </div>
      <div className={styles.fullMapCanvas}>
        <div className={styles.fullMapImage} style={{ backgroundImage: `url("${cityImage}")` }} />
        {clusterFields.map((cluster) => (
          <span
            key={cluster.id}
            className={styles.fullClusterField}
            style={{
              left: `${cluster.x}%`,
              top: `${cluster.y}%`,
              "--card-accent": toneColor(cluster.tone),
              "--cluster-size": cluster.size,
              "--cluster-height": cluster.height,
            } as CSSProperties}
          />
        ))}
        <svg className={styles.fullMapLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {topologyCurves.map((curve) => (
            <path
              key={curve.id}
              className={[styles.fullTopologyCurve, fullRouteToneClass(curve.tone)].join(" ")}
              d={curve.d}
            />
          ))}
          {microSignals.map((signal) => {
            const anchor = expandedNodes[signal.nodeIndex];
            return (
              <line key={signal.id} className={styles.fullMicroLink} x1={signal.x} y1={signal.y} x2={anchor.x} y2={anchor.y} />
            );
          })}
          <path className={styles.selectedSignalThread} d={`M ${eN0.x} ${eN0.y} C 36 42, 59 61, 84 74`} />
          {secondaryRoutes.map((route) => (
            <path
              key={route.id}
              className={[styles.fullRoute, styles.fullRouteSecondary, fullRouteToneClass(route.tone)].join(" ")}
              d={route.d}
            />
          ))}
          {fullMapPrimaryRoutes.map((route) => (
            <path
              key={route.id}
              className={[styles.fullRoute, styles.fullRoutePrimary, fullRouteToneClass(route.tone)].join(" ")}
              d={route.d}
            />
          ))}
          {fullMapPrimaryRoutes.map((route) => (
            <path
              key={`${route.id}-pulse`}
              className={[
                styles.fullRoutePulse,
                fullRouteToneClass(route.tone),
                fullPulseDurationClass(route.tone),
              ].filter(Boolean).join(" ")}
              d={route.d}
            />
          ))}
        </svg>
        {microSignals.map((signal, i) => (
          <span
            key={signal.id}
            className={styles.fullMapSignal}
            style={{
              left: `${signal.x}%`,
              top: `${signal.y}%`,
              "--card-accent": toneColor(signal.tone),
              animationDelay: `${(i * 320) % 2800}ms`,
            } as CSSProperties}
          />
        ))}
        {canvasScatter.map((dot, i) => (
          <span
            key={dot.id}
            className={[styles.scatterDot, scatterToneClass(dot.tone)].join(" ")}
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, animationDelay: `${(i * 180) % 3600}ms` }}
          />
        ))}
        {expandedNodes.map((node) => (
          <div
            key={node.label}
            className={styles.fullMapNode}
            style={{ left: `${node.x}%`, top: `${node.y}%`, "--card-accent": toneColor(node.tone) } as CSSProperties}
          >
            <span />
            <strong>{node.label}</strong>
            <small>{node.activity}</small>
          </div>
        ))}
        <aside className={styles.mapSidePanel}>
          <p className={styles.sideEyebrow}>Selected signal</p>
          <h2>San Lorenzo</h2>
          <p>Live room / 42 listening. Projection artists nearby and one open collaboration.</p>
          <button type="button">Enter room</button>
        </aside>
        <div className={styles.mapControlsStack} aria-hidden="true"><span>+</span><span>-</span><span>⌖</span></div>
      </div>
      <div className={styles.mapLiveTicker}>
        <span>Scene transmission</span>
        <strong>San Lorenzo / Explore room / 42 listening</strong>
        <em>Live ecosystem map</em>
      </div>
    </section>
  );
}
