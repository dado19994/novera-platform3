export type CityId = "default" | "barcelona" | "berlin" | "rome" | "copenhagen" | "bari";

export type MotionStyle = "settle" | "coastal-drift" | "slow-push" | "still-water" | "sea-breeze" | "global-orbit";

export interface CityMedia {
  id: CityId;
  city: string;
  country: string;
  sceneTitle: string;
  cityStory: string;
  character: string;
  pulse: string;
  videoSrc: string;
  imageSrc: string;
  overlayGradient: string;
  colorGrade: string;
  focalPoint: string;
  motionStyle: MotionStyle;
  palette: {
    backgroundFrom: string;
    backgroundMiddle: string;
    backgroundTo: string;
    ambientGlow: string;
    accentGlow: string;
    shadow: string;
  };
  ambientParticles: {
    count: number;
    speed: number;
    label: string;
  };
  mediaDescriptor: string;
}

export const CITY_MEDIA: Record<CityId, CityMedia> = {
  default: {
    id: "default",
    city: "Global",
    country: "Connected scenes",
    sceneTitle: "Global creative network",
    cityStory: "Aerial night routes connecting creative cities across a shared horizon.",
    character: "Warm global pulse",
    pulse: "46 active signals",
    videoSrc: "/media/cities/global.mp4",
    imageSrc: "/media/cities/global.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "50% 42%",
    motionStyle: "global-orbit",
    palette: {
      backgroundFrom: "#08070D",
      backgroundMiddle: "#0F0D1A",
      backgroundTo: "#08070D",
      ambientGlow: "#6C4FD4",
      accentGlow: "#C8F000",
      shadow: "#08070D",
    },
    ambientParticles: { count: 19, speed: 0.16, label: "Connected signals" },
    mediaDescriptor: "Aerial city network / night",
  },
  rome: {
    id: "rome",
    city: "Rome",
    country: "Italy",
    sceneTitle: "Rome creative map",
    cityStory: "A warm aerial arrival above historic rooftops, stone landmarks and evening movement.",
    character: "Historic warm cinematic",
    pulse: "34 cultural movements",
    videoSrc: "/media/cities/rome.mp4",
    imageSrc: "/media/cities/rome.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "52% 38%",
    motionStyle: "settle",
    palette: {
      backgroundFrom: "#0A0810",
      backgroundMiddle: "#110D1E",
      backgroundTo: "#08070D",
      ambientGlow: "#6C4FD4",
      accentGlow: "#FF3D7F",
      shadow: "#08070D",
    },
    ambientParticles: { count: 16, speed: 0.11, label: "Evening light" },
    mediaDescriptor: "Historic aerial / golden hour",
  },
  barcelona: {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    sceneTitle: "Barcelona coastal scene",
    cityStory: "The coastline and lit urban grid meeting after sunset, alive with Mediterranean color.",
    character: "Mediterranean nightlife",
    pulse: "28 signals after sunset",
    videoSrc: "/media/cities/barcelona.mp4",
    imageSrc: "/media/cities/barcelona.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "52% 47%",
    motionStyle: "coastal-drift",
    palette: {
      backgroundFrom: "#0C0814",
      backgroundMiddle: "#140F22",
      backgroundTo: "#08070D",
      ambientGlow: "#9B7FFF",
      accentGlow: "#FF3D7F",
      shadow: "#08070D",
    },
    ambientParticles: { count: 22, speed: 0.2, label: "Night coast lights" },
    mediaDescriptor: "Coastal aerial / nightlife",
  },
  berlin: {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    sceneTitle: "Berlin warehouse pulse",
    cityStory: "An industrial night approach across dense roofs, warehouse corridors and low light.",
    character: "Industrial underground",
    pulse: "19 late-room signals",
    videoSrc: "/media/cities/berlin.mp4",
    imageSrc: "/media/cities/berlin.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "48% 43%",
    motionStyle: "slow-push",
    palette: {
      backgroundFrom: "#080710",
      backgroundMiddle: "#0E0C1C",
      backgroundTo: "#06050C",
      ambientGlow: "#5A3EC8",
      accentGlow: "#C8F000",
      shadow: "#06050C",
    },
    ambientParticles: { count: 11, speed: 0.09, label: "Low light haze" },
    mediaDescriptor: "Industrial aerial / night",
  },
  copenhagen: {
    id: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    sceneTitle: "Copenhagen waterline",
    cityStory: "A quiet aerial glide across waterfront architecture, cool air and reflected light.",
    character: "Nordic minimal cold",
    pulse: "14 precise signals",
    videoSrc: "/media/cities/copenhagen.mp4",
    imageSrc: "/media/cities/copenhagen.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "50% 50%",
    motionStyle: "still-water",
    palette: {
      backgroundFrom: "#080C14",
      backgroundMiddle: "#0D1220",
      backgroundTo: "#06080F",
      ambientGlow: "#4ABFB0",
      accentGlow: "#9B7FFF",
      shadow: "#06080F",
    },
    ambientParticles: { count: 9, speed: 0.07, label: "Water lights" },
    mediaDescriptor: "Waterfront aerial / blue hour",
  },
  bari: {
    id: "bari",
    city: "Bari",
    country: "Italy",
    sceneTitle: "Bari sea-front night",
    cityStory: "A southern night settling above limestone roofs and the Adriatic harbor edge.",
    character: "Southern coastal warmth",
    pulse: "17 harbor-side signals",
    videoSrc: "/media/cities/bari.mp4",
    imageSrc: "/media/cities/bari.jpg",
    overlayGradient: "linear-gradient(180deg, rgba(8, 6, 14, 0.20) 0%, rgba(8, 6, 14, 0.45) 42%, rgba(6, 5, 12, 0.90) 100%)",
    colorGrade: "saturate(0.85) contrast(1.08) brightness(0.62)",
    focalPoint: "53% 49%",
    motionStyle: "sea-breeze",
    palette: {
      backgroundFrom: "#0A0810",
      backgroundMiddle: "#12101E",
      backgroundTo: "#08070D",
      ambientGlow: "#7B5CF0",
      accentGlow: "#00D4B4",
      shadow: "#08070D",
    },
    ambientParticles: { count: 17, speed: 0.13, label: "Harbor air" },
    mediaDescriptor: "Sea-front aerial / warm night",
  },
};

export const CITY_ORDER: CityId[] = ["rome", "barcelona", "berlin", "copenhagen", "bari", "default"];
