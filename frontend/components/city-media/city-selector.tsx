"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CITY_MEDIA, CITY_ORDER } from "@/lib/city-media";
import { useCityMedia } from "@/components/city-media/city-media-provider";

const PRIMARY_CITIES = CITY_ORDER.slice(0, 6);
const MORE_CITIES = CITY_ORDER.slice(6);

export function CitySelector() {
  const { city, setCity } = useCityMedia();
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const filteredMore = MORE_CITIES.filter((id) =>
    CITY_MEDIA[id].city.toLowerCase().includes(query.toLowerCase())
  );

  const isMoreSelected = MORE_CITIES.includes(city);

  return (
    <div className="city-selector-wrap">

      {/* RIGA PRINCIPALE CITTÀ */}
      <div
        className="city-selector glass-panel flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full p-1.5"
        aria-label="Select city"
      >
        {PRIMARY_CITIES.map((cityId) => {
          const selected = cityId === city;
          return (
            <button
              key={cityId}
              type="button"
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs tracking-wide transition-all ${
                selected
                  ? "font-semibold text-(--ice)"
                  : "text-(--muted-ivory) hover:text-(--soft-ivory)"
              }`}
              aria-pressed={selected}
              onClick={() => { setCity(cityId); setExpanded(false); }}
            >
              {selected && (
                <motion.span
                  layoutId="city-pill"
                  className="absolute inset-0 rounded-full border border-white/10"
                  style={{
                    background: "color-mix(in srgb, var(--scene-primary) 14%, rgba(255,255,255,0.04))",
                    boxShadow: "0 0 20px color-mix(in srgb, var(--scene-primary) 20%, transparent)",
                  }}
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.16, duration: 0.44 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {selected && (
                  <span className="live-beacon h-1.5 w-1.5 rounded-full" style={{ background: "var(--rose)" }} />
                )}
                {CITY_MEDIA[cityId].city}
              </span>
            </button>
          );
        })}

        {/* BOTTONE MORE */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="relative shrink-0 transition-opacity hover:opacity-80"
          style={{
            background: "rgba(200, 240, 0, 0.12)",
            border: "0.5px solid rgba(200, 240, 0, 0.35)",
            color: "var(--acid)",
            borderRadius: "999px",
            padding: "0.4rem 1rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {isMoreSelected ? (
            <span className="flex items-center gap-2">
              <span className="live-beacon h-1.5 w-1.5 rounded-full" style={{ background: "var(--rose)" }} />
              {CITY_MEDIA[city].city}
            </span>
          ) : (
            <span>{expanded ? "↑ Less" : "+ More"}</span>
          )}
        </button>
      </div>

      {/* PANNELLO ESPANSO — inline, NON absolute */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="city-more-panel glass-panel mt-2 rounded-[1.4rem] p-4">

              {/* SEARCH */}
              <div className="mb-3 flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-2">
                <span className="text-xs text-(--muted-ivory)" aria-hidden="true">⌕</span>
                <input
                  type="text"
                  placeholder="Search city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-(--soft-ivory) placeholder:text-(--muted-ivory) outline-none"
                />
              </div>

              {/* GRIGLIA CITTÀ */}
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {filteredMore.map((cityId) => {
                  const selected = cityId === city;
                  return (
                    <button
                      key={cityId}
                      type="button"
                      onClick={() => { setCity(cityId); setExpanded(false); setQuery(""); }}
                      className="rounded-[0.9rem] px-2 py-2.5 text-left transition-all"
                      style={{
                        background: selected
                          ? "color-mix(in srgb, var(--scene-primary) 18%, rgba(255,255,255,0.04))"
                          : "rgba(255,255,255,0.03)",
                        border: `0.5px solid ${selected
                          ? "color-mix(in srgb, var(--scene-primary) 35%, transparent)"
                          : "rgba(255,255,255,0.06)"}`,
                        color: selected ? "var(--ice)" : "var(--muted-ivory)",
                      }}
                    >
                      <span className="block truncate text-[0.75rem] font-medium">
                        {CITY_MEDIA[cityId].city}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6rem] opacity-50">
                        {CITY_MEDIA[cityId].country}
                      </span>
                    </button>
                  );
                })}
                {filteredMore.length === 0 && (
                  <p className="col-span-5 py-3 text-center text-xs text-(--muted-ivory)">
                    No cities found
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
