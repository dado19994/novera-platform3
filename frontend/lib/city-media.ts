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
    overlayGradient: "linear-gradient(180deg, rgba(7, 9, 14, 0.26) 0%, rgba(8, 9, 14, 0.50) 44%, rgba(8, 9, 14, 0.88) 100%)",
    colorGrade: "saturate(0.96) contrast(1.10) brightness(0.66) sepia(0.14)",
    focalPoint: "50% 42%",
    motionStyle: "global-orbit",
    palette: {
      backgroundFrom: "#11131b",
      backgroundMiddle: "#191724",
      backgroundTo: "#080a0f",
      ambientGlow: "#bf835c",
      accentGlow: "#65537b",
      shadow: "#080a0f",
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
    overlayGradient: "linear-gradient(180deg, rgba(19, 12, 9, 0.21) 0%, rgba(17, 10, 9, 0.44) 42%, rgba(8, 9, 12, 0.88) 100%)",
    colorGrade: "saturate(1.03) contrast(1.12) brightness(0.69) sepia(0.25) hue-rotate(-6deg)",
    focalPoint: "52% 38%",
    motionStyle: "settle",
    palette: {
      backgroundFrom: "#231916",
      backgroundMiddle: "#241a1c",
      backgroundTo: "#090b10",
      ambientGlow: "#dea35e",
      accentGlow: "#ad6650",
      shadow: "#130e0d",
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
    overlayGradient: "linear-gradient(180deg, rgba(21, 10, 17, 0.18) 0%, rgba(26, 12, 17, 0.40) 39%, rgba(7, 10, 14, 0.87) 100%)",
    colorGrade: "saturate(1.16) contrast(1.10) brightness(0.70) sepia(0.15) hue-rotate(-8deg)",
    focalPoint: "52% 47%",
    motionStyle: "coastal-drift",
    palette: {
      backgroundFrom: "#24151b",
      backgroundMiddle: "#291921",
      backgroundTo: "#090e13",
      ambientGlow: "#df945a",
      accentGlow: "#cf6259",
      shadow: "#100d12",
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
    overlayGradient: "linear-gradient(180deg, rgba(4, 7, 11, 0.27) 0%, rgba(5, 8, 13, 0.52) 45%, rgba(5, 7, 11, 0.90) 100%)",
    colorGrade: "saturate(0.72) contrast(1.20) brightness(0.59) sepia(0.05) hue-rotate(8deg)",
    focalPoint: "48% 43%",
    motionStyle: "slow-push",
    palette: {
      backgroundFrom: "#0d1218",
      backgroundMiddle: "#131923",
      backgroundTo: "#06080c",
      ambientGlow: "#9e8792",
      accentGlow: "#68617f",
      shadow: "#050609",
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
    overlayGradient: "linear-gradient(180deg, rgba(5, 14, 22, 0.22) 0%, rgba(5, 14, 22, 0.41) 45%, rgba(5, 10, 16, 0.88) 100%)",
    colorGrade: "saturate(0.84) contrast(1.10) brightness(0.69) sepia(0.06) hue-rotate(7deg)",
    focalPoint: "50% 50%",
    motionStyle: "still-water",
    palette: {
      backgroundFrom: "#0d1a25",
      backgroundMiddle: "#11202b",
      backgroundTo: "#060b13",
      ambientGlow: "#9dbcc2",
      accentGlow: "#d0a06c",
      shadow: "#061017",
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
    overlayGradient: "linear-gradient(180deg, rgba(16, 12, 10, 0.20) 0%, rgba(14, 13, 14, 0.42) 43%, rgba(7, 10, 13, 0.88) 100%)",
    colorGrade: "saturate(1.06) contrast(1.11) brightness(0.71) sepia(0.22)",
    focalPoint: "53% 49%",
    motionStyle: "sea-breeze",
    palette: {
      backgroundFrom: "#201a17",
      backgroundMiddle: "#172028",
      backgroundTo: "#070d12",
      ambientGlow: "#dda66a",
      accentGlow: "#c4775f",
      shadow: "#090d11",
    },
    ambientParticles: { count: 17, speed: 0.13, label: "Harbor air" },
    mediaDescriptor: "Sea-front aerial / warm night",
  },
};

export const CITY_ORDER: CityId[] = ["rome", "barcelona", "berlin", "copenhagen", "bari", "default"];
