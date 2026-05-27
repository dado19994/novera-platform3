import type { ReactNode } from "react";
import { CityMediaBackground } from "@/components/city-media/city-media-background";
import { FloatingDock } from "@/components/layout/floating-dock";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <CityMediaBackground />
      <div className="global-ecosystem-field" aria-hidden="true" />
      <div className="scene-content relative z-10 mx-auto w-full max-w-[1380px] px-5 pb-12 pt-6 sm:px-8 lg:px-12">
        {children}
      </div>
      <FloatingDock />
    </div>
  );
}
