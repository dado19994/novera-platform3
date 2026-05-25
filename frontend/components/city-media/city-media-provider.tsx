"use client";

import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { CITY_MEDIA, type CityId, type CityMedia } from "@/lib/city-media";

interface CityMediaContextValue {
  city: CityId;
  media: CityMedia;
  setCity: (city: CityId) => void;
}

const CityMediaContext = createContext<CityMediaContextValue | undefined>(undefined);

interface CityMediaProviderProps {
  children: ReactNode;
  initialCity?: CityId;
}

export function CityMediaProvider({ children, initialCity = "default" }: CityMediaProviderProps) {
  const [city, setCity] = useState<CityId>(initialCity);
  const media = CITY_MEDIA[city];
  const value = useMemo(() => ({ city, media, setCity }), [city, media]);
  const style = {
    "--scene-from": media.palette.backgroundFrom,
    "--scene-middle": media.palette.backgroundMiddle,
    "--scene-to": media.palette.backgroundTo,
    "--scene-primary": media.palette.ambientGlow,
    "--scene-secondary": media.palette.accentGlow,
    "--scene-shadow": media.palette.shadow,
  } as CSSProperties;

  return (
    <CityMediaContext.Provider value={value}>
      <div className={`city-media-root city-mood-${media.motionStyle}`} style={style}>
        {children}
      </div>
    </CityMediaContext.Provider>
  );
}

export function useCityMedia() {
  const context = useContext(CityMediaContext);

  if (!context) {
    throw new Error("useCityMedia must be used within CityMediaProvider");
  }

  return context;
}
