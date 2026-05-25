import type { ReactNode } from "react";

interface CinematicCardProps {
  children: ReactNode;
  className?: string;
  breathe?: boolean;
}

export function CinematicCard({ children, className = "", breathe = false }: CinematicCardProps) {
  return (
    <article
      className={`cinematic-card surface-matte depth-card rounded-3xl ${breathe ? "card-breathe" : ""} ${className}`}
    >
      {children}
    </article>
  );
}
