"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface CinematicCardProps {
  children: ReactNode;
  className?: string;
  breathe?: boolean;
}

export function CinematicCard({ children, className = "", breathe = false }: CinematicCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className={`cinematic-card rounded-3xl border border-white/8 ${breathe ? "card-breathe" : ""} ${className}`}
      whileHover={reducedMotion ? undefined : { y: -3, borderColor: "rgba(243, 238, 230, 0.14)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.article>
  );
}
