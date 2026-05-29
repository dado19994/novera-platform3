"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCityMedia } from "@/components/city-media/city-media-provider";

export function CityMediaBackground() {
  const { media } = useCityMedia();
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      key={media.id}
      className="city-media-reset pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, ease: "easeOut" }}
    >
      <div className="city-media-base" />
      <div className="city-media-texture" />
    </motion.div>
  );
}
