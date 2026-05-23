"use client";

import { motion, useReducedMotion } from "framer-motion";

const DOCK_LINKS = [
  { label: "Ecosystem", glyph: "O" },
  { label: "Map", glyph: "+" },
  { label: "Opportunities", glyph: "~" },
  { label: "Audio", glyph: ">" },
  { label: "Profile", glyph: "." },
];

export function FloatingDock() {
  const reducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="floating-dock glass-panel fixed bottom-4 left-1/2 z-30 flex max-w-[calc(100vw-1.25rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full p-1.5 shadow-2xl shadow-black/30 sm:bottom-5"
    >
      {DOCK_LINKS.map(({ label, glyph }, index) => (
        <motion.button
          key={label}
          type="button"
          className={`group flex h-11 shrink-0 items-center gap-2 rounded-full px-2.5 text-xs transition-colors sm:h-12 sm:px-4 ${
            index === 0 ? "dock-active bg-white/10 text-(--soft-ivory)" : "text-(--muted-ivory) hover:text-(--soft-ivory)"
          }`}
          whileHover={reducedMotion ? undefined : { y: -2 }}
          aria-current={index === 0 ? "page" : undefined}
        >
          <span className="dock-glyph flex h-5 w-5 items-center justify-center rounded-full border border-white/12 text-[0.62rem]">
            {glyph}
          </span>
          <span className="hidden sm:block">{label}</span>
        </motion.button>
      ))}
    </nav>
  );
}
