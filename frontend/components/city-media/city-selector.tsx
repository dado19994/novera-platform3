"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CITY_MEDIA, CITY_ORDER, type CityId } from "@/lib/city-media";
import { MOCK_ECOSYSTEM } from "@/lib/mock-data";
import { useCityMedia } from "@/components/city-media/city-media-provider";

const FEATURED_CITIES = CITY_ORDER.slice(0, 2);
const MORE_CITIES = CITY_ORDER.slice(FEATURED_CITIES.length);

export function CitySelector() {
  const { city, setCity } = useCityMedia();
  const reducedMotion = useReducedMotion();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const normalizedQuery = query.trim().toLowerCase();
  const availableCities = normalizedQuery
    ? CITY_ORDER.filter((id) => CITY_MEDIA[id].city.toLowerCase().includes(normalizedQuery))
    : MORE_CITIES;
  const isMoreSelected = MORE_CITIES.includes(city);
  const portalTarget = typeof document === "undefined" ? null : document.body;

  const closePanel = useCallback((restoreFocus = true) => {
    setExpanded(false);
    setQuery("");

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const updatePanelGeometry = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger || typeof window === "undefined") {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.min(544, window.innerWidth - 32);
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - panelWidth - 16));

    setPanelStyle({
      "--city-panel-left": `${left}px`,
      "--city-panel-top": `${rect.bottom + 12}px`,
      "--city-panel-width": `${panelWidth}px`,
    } as CSSProperties);
  }, []);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    updatePanelGeometry();
    searchRef.current?.focus();

    function closeOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;

      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        closePanel();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updatePanelGeometry);
    window.addEventListener("scroll", updatePanelGeometry, true);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updatePanelGeometry);
      window.removeEventListener("scroll", updatePanelGeometry, true);
    };
  }, [expanded, closePanel, updatePanelGeometry]);

  function selectCity(nextCity: CityId) {
    setCity(nextCity);
    closePanel();
  }

  function cityPreviewStyle(cityId: CityId) {
    const preview = CITY_MEDIA[cityId];

    return {
      "--preview-accent": preview.palette.ambientGlow,
      backgroundImage: `linear-gradient(104deg, rgba(7, 6, 13, 0.26), rgba(7, 6, 13, 0.88)), url("${preview.imageSrc}")`,
      backgroundPosition: preview.focalPoint,
    } as CSSProperties;
  }

  return (
    <div ref={rootRef} className={`city-selector-wrap relative ${expanded ? "is-expanded" : ""}`}>
      <div className="city-selector flex items-center gap-1 rounded-full p-1" aria-label="Choose a city">
        {FEATURED_CITIES.map((cityId) => {
          const selected = cityId === city;

          return (
            <button
              key={cityId}
              type="button"
              className={`city-pill relative shrink-0 rounded-full px-3.5 py-2 text-xs tracking-wide transition-colors ${
                selected ? "font-semibold text-(--ice)" : "text-(--muted-ivory) hover:text-(--soft-ivory)"
              }`}
              aria-pressed={selected}
              onClick={() => selectCity(cityId)}
            >
              {selected && (
                <motion.span
                  layoutId="city-pill"
                  className="absolute inset-0 rounded-full"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.16, duration: 0.44 }}
                />
              )}
              <span className="relative">{CITY_MEDIA[cityId].city}</span>
            </button>
          );
        })}
        <button
          ref={triggerRef}
          type="button"
          aria-controls={panelId}
          aria-expanded={expanded}
          aria-haspopup="dialog"
          onClick={() => {
            if (expanded) {
              closePanel(false);
            } else {
              updatePanelGeometry();
              setExpanded(true);
            }
          }}
          className={`city-more-trigger flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs ${
            isMoreSelected ? "is-selected" : ""
          }`}
        >
          <span>{isMoreSelected ? CITY_MEDIA[city].city : "More cities"}</span>
          <span className={`city-chevron ${expanded ? "is-open" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {portalTarget && createPortal(
        <AnimatePresence>
          {expanded && (
            <>
              <motion.button
                type="button"
                aria-label="Close city selector"
                className="city-sheet-backdrop"
                onClick={() => closePanel()}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
              />
              <motion.div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label="Choose a city"
                className="city-more-panel rounded-[1.55rem] p-3"
                style={panelStyle}
                initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -5, scale: 0.985 }}
                transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
              >
                <span className="city-sheet-handle" aria-hidden="true" />
                <label className="city-search mb-3 flex items-center gap-2 rounded-full px-3 py-2.5">
                  <span className="text-xs text-(--muted-ivory)" aria-hidden="true">/</span>
                  <span className="sr-only">Search cities</span>
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search all cities"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-xs text-(--soft-ivory) placeholder:text-(--muted-ivory) outline-none"
                  />
                </label>
                <div className="city-results grid max-h-[27rem] grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                  {availableCities.map((cityId) => {
                    const selected = cityId === city;
                    const preview = CITY_MEDIA[cityId];
                    const pulse = MOCK_ECOSYSTEM[cityId].livePulse[0];

                    return (
                      <button
                        key={cityId}
                        type="button"
                        onClick={() => selectCity(cityId)}
                        className={`city-result group relative min-h-[5.8rem] overflow-hidden rounded-[1.05rem] p-3 text-left ${selected ? "is-selected" : ""}`}
                        style={cityPreviewStyle(cityId)}
                      >
                        <span className="city-result-glow absolute inset-y-0 left-0 w-px" />
                        <span className="relative flex h-full flex-col justify-between gap-3">
                          <span className="flex items-start justify-between gap-2">
                            <span>
                              <span className="block truncate text-sm font-medium text-(--soft-ivory)">{preview.city}</span>
                              <span className="mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.15em] text-(--muted-ivory)">
                                {preview.country}
                              </span>
                            </span>
                            <span className="city-result-live flex shrink-0 items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.16em]">
                              <span className="h-1.5 w-1.5 rounded-full" />
                              Live
                            </span>
                          </span>
                          <span className="flex items-end justify-between gap-3">
                            <span className="truncate text-[0.62rem] text-(--muted-ivory)">{preview.character}</span>
                            <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.62rem] text-(--soft-ivory)">
                              {pulse.value} active
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {availableCities.length === 0 && (
                    <p className="col-span-full py-5 text-center text-xs text-(--muted-ivory)">No cities found</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        portalTarget,
      )}
    </div>
  );
}
