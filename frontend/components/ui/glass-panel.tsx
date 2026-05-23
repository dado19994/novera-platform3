import type { HTMLAttributes, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassPanel({ children, className = "", ...props }: GlassPanelProps) {
  return (
    <div className={`glass-panel rounded-[1.6rem] ${className}`} {...props}>
      {children}
    </div>
  );
}
