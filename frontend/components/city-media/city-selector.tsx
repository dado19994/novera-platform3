"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CITY_MEDIA, CITY_ORDER } from "@/lib/city-media";
import { useCityMedia } from "@/components/city-media/city-media-provider";

export function CitySelector() {
  const { city, setCity } = useCityMedia();
  const reducedMotion = useReducedMotion();

  return (
    <div className="city-selector glass-panel flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full p-1.5" aria-label="Select city media background">
      {CITY_ORDER.map((cityId) => {
        const selected = cityId === city;

        return (
          <button
            key={cityId}
            type="button"
            className="relative shrink-0 rounded-full px-4 py-2.5 text-xs tracking-wide text-(--muted-ivory) transition-all hover:text-(--soft-ivory) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--acid)"
            aria-pressed={selected}
            onClick={() => setCity(cityId)}
          >
            {selected && (
              <motion.span
                layoutId="selected-city"
                className="absolute inset-0 rounded-full border border-white/10"
                style={{
                  background: "color-mix(in srgb, var(--scene-primary) 12%, rgba(255, 255, 255, 0.04))",
                  boxShadow: "0 0 24px color-mix(in srgb, var(--scene-primary) 16%, transparent)",
                }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.16, duration: 0.48 }}
              />
            )}
            <span
              className="relative flex items-center gap-2 font-medium"
              style={{ color: selected ? "var(--ice)" : undefined, fontSize: selected ? "0.8rem" : "0.75rem" }}
            >
              {selected && (
                <span
                  className="live-beacon h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--rose)" }}
                />
              )}
              {CITY_MEDIA[cityId].city}
            </span>
          </button>
        );
      })}
    </div>
  );
}
