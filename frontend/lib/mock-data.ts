import type { CityId } from "@/lib/city-media";

export interface CulturalMoment {
  title: string;
  kind: string;
  place: string;
  time: string;
  mood: string;
}

export interface Opportunity {
  title: string;
  creator: string;
  need: string;
  deadline: string;
}

export type ActivityState = "live now" | "open call" | "listening room" | "studio open";

export interface AmbientActivity {
  actor: string;
  action: string;
  place: string;
  time: string;
  kind: "work" | "collective" | "room" | "session" | "collaboration" | "arrival";
}

export interface CityEcosystem {
  mapNodes: Array<{
    label: string;
    type: string;
    strength: number;
    x: number;
    y: number;
    state: ActivityState;
    activity: string;
  }>;
  livePulse: Array<{ label: string; value: number; detail: string }>;
  matchedSignals: Array<{ label: string; detail: string; confidence: string }>;
  tonight: CulturalMoment[];
  opportunities: Opportunity[];
  audio: { title: string; artist: string; context: string; length: string };
}

// Laravel integration boundary: replace these fixtures with typed discovery,
// events, collaboration, and track API clients once the frontend is connected.
export const MOCK_ECOSYSTEM: Record<CityId, CityEcosystem> = {
  rome: {
    mapNodes: [
      { label: "San Lorenzo", type: "Live room", strength: 88, x: 18, y: 34, state: "live now", activity: "42 listening" },
      { label: "Ostiense", type: "New media", strength: 72, x: 57, y: 53, state: "open call", activity: "3 artists needed" },
      { label: "Pigneto", type: "Listening", strength: 64, x: 72, y: 27, state: "listening room", activity: "Room opening" },
      { label: "Trastevere", type: "Moving image", strength: 47, x: 36, y: 70, state: "studio open", activity: "Screening in 40m" },
    ],
    livePulse: [
      { label: "Artists active now", value: 148, detail: "+12 since dusk" },
      { label: "Collectives recruiting", value: 9, detail: "3 match your craft" },
      { label: "Events starting soon", value: 14, detail: "Next in 18 min" },
      { label: "Audio rooms live", value: 6, detail: "2 spatial sessions" },
    ],
    matchedSignals: [
      { label: "Spatial sound", detail: "2 listening rooms tonight", confidence: "High affinity" },
      { label: "Analog image", detail: "Open exhibition circle", confidence: "Near you" },
      { label: "Live visuals", detail: "Collective request rising", confidence: "New" },
    ],
    tonight: [
      { title: "Ruins in Frequency", kind: "Listening session", place: "Ostiense", time: "21:30", mood: "Textural" },
      { title: "Afterlight Studies", kind: "Moving image", place: "Pigneto", time: "22:00", mood: "Intimate" },
      { title: "Courtyard Resonance", kind: "Live set", place: "San Lorenzo", time: "23:15", mood: "Warm" },
    ],
    opportunities: [
      { title: "Light artist for live score", creator: "Cava Studio", need: "Projection / DMX", deadline: "Closes Sun" },
      { title: "Field recordings archive", creator: "Forma Roma", need: "Sound artists", deadline: "5 places" },
    ],
    audio: {
      title: "Travertine Echoes",
      artist: "Alba Forma",
      context: "Recorded at dusk in a disused cinema",
      length: "04:28",
    },
  },
  barcelona: {
    mapNodes: [
      { label: "Poblenou", type: "Studio", strength: 91, x: 62, y: 32, state: "live now", activity: "Installation active" },
      { label: "Raval", type: "Selectors", strength: 68, x: 27, y: 48, state: "listening room", activity: "57 tuned in" },
      { label: "Montjuic", type: "Performance", strength: 74, x: 46, y: 67, state: "open call", activity: "Movement wanted" },
    ],
    livePulse: [
      { label: "Artists active now", value: 171, detail: "Coastal night rising" },
      { label: "Collectives recruiting", value: 12, detail: "4 performance calls" },
      { label: "Events starting soon", value: 18, detail: "Poblenou leads" },
      { label: "Audio rooms live", value: 8, detail: "Sunset transmissions" },
    ],
    matchedSignals: [
      { label: "Coastal electronics", detail: "3 new works", confidence: "High affinity" },
      { label: "Night installations", detail: "Poblenou cluster", confidence: "Trending nearby" },
      { label: "Movement", detail: "Open rehearsal", confidence: "Tonight" },
    ],
    tonight: [
      { title: "Tidal Rooms", kind: "Installation", place: "Poblenou", time: "20:45", mood: "Luminous" },
      { title: "Salt Air Tapes", kind: "Live recording", place: "Raval", time: "22:30", mood: "Loose" },
      { title: "Azotea Motion", kind: "Performance", place: "Gracia", time: "23:00", mood: "Electric" },
    ],
    opportunities: [
      { title: "Dancer for sea-wall film", creator: "Playa Assembly", need: "Movement", deadline: "48 hours" },
      { title: "Modular live partner", creator: "Flux BCN", need: "Synth artist", deadline: "Open" },
    ],
    audio: { title: "Low Tide Cinema", artist: "Mar Blava", context: "A coastal night study", length: "05:12" },
  },
  berlin: {
    mapNodes: [
      { label: "Neukolln", type: "Audio", strength: 83, x: 53, y: 60, state: "listening room", activity: "Subfloor live" },
      { label: "Wedding", type: "Workshop", strength: 57, x: 35, y: 27, state: "studio open", activity: "Editions viewing" },
      { label: "Friedrichshain", type: "Performance", strength: 89, x: 69, y: 40, state: "live now", activity: "AV room full" },
    ],
    livePulse: [
      { label: "Artists active now", value: 126, detail: "Late rooms forming" },
      { label: "Collectives recruiting", value: 16, detail: "AV skills sought" },
      { label: "Events starting soon", value: 11, detail: "Night schedule" },
      { label: "Audio rooms live", value: 13, detail: "Low-frequency" },
    ],
    matchedSignals: [
      { label: "Concrete acoustics", detail: "Warehouse session", confidence: "Strong match" },
      { label: "Generative visuals", detail: "2 collaborators needed", confidence: "Open" },
      { label: "Print editions", detail: "Studio visiting hour", confidence: "Local" },
    ],
    tonight: [
      { title: "Pressure System", kind: "AV work", place: "Friedrichshain", time: "23:40", mood: "Dense" },
      { title: "Grey Room Editions", kind: "Open studio", place: "Wedding", time: "19:00", mood: "Quiet" },
      { title: "Subfloor Dialogue", kind: "Listening", place: "Neukolln", time: "00:20", mood: "Deep" },
    ],
    opportunities: [
      { title: "Projection mapping resident", creator: "Raster Haus", need: "Visual artist", deadline: "Jun 02" },
      { title: "Tape loop ensemble", creator: "Kanal Sound", need: "Performer", deadline: "Tonight" },
    ],
    audio: { title: "Ventilation Studies", artist: "Null Raum", context: "Industrial resonance, live take", length: "06:41" },
  },
  copenhagen: {
    mapNodes: [
      { label: "Refshaleoen", type: "Light art", strength: 77, x: 61, y: 35, state: "live now", activity: "Harbor light" },
      { label: "Norrebro", type: "Design", strength: 55, x: 33, y: 45, state: "studio open", activity: "Materials open" },
      { label: "Vesterbro", type: "Listening", strength: 63, x: 44, y: 65, state: "listening room", activity: "Quiet current" },
    ],
    livePulse: [
      { label: "Artists active now", value: 82, detail: "Curated calm" },
      { label: "Collectives recruiting", value: 5, detail: "Light / sound" },
      { label: "Events starting soon", value: 7, detail: "Harbor first" },
      { label: "Audio rooms live", value: 4, detail: "High fidelity" },
    ],
    matchedSignals: [
      { label: "Ambient composition", detail: "Harbor session", confidence: "Selected" },
      { label: "Material study", detail: "Small exhibition", confidence: "Nearby" },
      { label: "Nordic light", detail: "Installation call", confidence: "New" },
    ],
    tonight: [
      { title: "Blue Hour Forms", kind: "Installation", place: "Refshaleoen", time: "20:00", mood: "Clear" },
      { title: "Quiet Current", kind: "Listening", place: "Vesterbro", time: "21:15", mood: "Still" },
      { title: "Paper and Frost", kind: "Studio", place: "Norrebro", time: "18:30", mood: "Minimal" },
    ],
    opportunities: [
      { title: "Sound for glass pavilion", creator: "North Room", need: "Composer", deadline: "4 days" },
      { title: "Editorial photographer", creator: "Line Archive", need: "Photography", deadline: "Open" },
    ],
    audio: { title: "Harbor Glass", artist: "Signe Vale", context: "An early winter recording", length: "03:56" },
  },
  bari: {
    mapNodes: [
      { label: "Murat", type: "Gallery", strength: 62, x: 40, y: 35, state: "studio open", activity: "Doors open" },
      { label: "Porto", type: "Sound", strength: 85, x: 66, y: 55, state: "live now", activity: "Sea-front set" },
      { label: "Madonnella", type: "Film", strength: 59, x: 27, y: 63, state: "open call", activity: "Score needed" },
    ],
    livePulse: [
      { label: "Artists active now", value: 64, detail: "Harbor gathering" },
      { label: "Collectives recruiting", value: 7, detail: "Local stories" },
      { label: "Events starting soon", value: 9, detail: "Next at Porto" },
      { label: "Audio rooms live", value: 5, detail: "Field textures" },
    ],
    matchedSignals: [
      { label: "Harbor recordings", detail: "Sunset gathering", confidence: "Close" },
      { label: "Documentary lens", detail: "Open collaboration", confidence: "Relevant" },
      { label: "Percussion", detail: "New movement", confidence: "Tonight" },
    ],
    tonight: [
      { title: "Stone and Salt", kind: "Film score", place: "Madonnella", time: "21:00", mood: "Tender" },
      { title: "Port Light", kind: "Listening", place: "Porto", time: "22:10", mood: "Open" },
      { title: "Linea Calda", kind: "Exhibition", place: "Murat", time: "19:30", mood: "Sunlit" },
    ],
    opportunities: [
      { title: "Sea-front short film", creator: "Levante Lab", need: "Composer", deadline: "3 days" },
      { title: "Community sound walk", creator: "Porto Aperto", need: "Field audio", deadline: "Open" },
    ],
    audio: { title: "Molo Lento", artist: "Duna", context: "Harbor textures after rain", length: "04:03" },
  },
  default: {
    mapNodes: [
      { label: "Rome", type: "34 movements", strength: 78, x: 49, y: 55, state: "live now", activity: "148 artists" },
      { label: "Barcelona", type: "28 signals", strength: 81, x: 26, y: 45, state: "live now", activity: "Coastal pulse" },
      { label: "Berlin", type: "19 rooms", strength: 67, x: 56, y: 28, state: "listening room", activity: "13 live rooms" },
      { label: "Copenhagen", type: "14 studies", strength: 45, x: 65, y: 17, state: "open call", activity: "Light artist" },
    ],
    livePulse: [
      { label: "Artists active now", value: 591, detail: "Across 18 cities" },
      { label: "Collectives recruiting", value: 48, detail: "Global calls" },
      { label: "Events starting soon", value: 86, detail: "Next hour" },
      { label: "Audio rooms live", value: 31, detail: "Connected listening" },
    ],
    matchedSignals: [
      { label: "Cross-city listening", detail: "Curated trail", confidence: "For you" },
      { label: "Moving image", detail: "5 open calls", confidence: "Global" },
      { label: "Residencies", detail: "New this week", confidence: "Emerging" },
    ],
    tonight: [
      { title: "Connected Nights", kind: "Editorial trail", place: "5 cities", time: "Now", mood: "Global" },
      { title: "Soft Signals", kind: "Audio selections", place: "Europe", time: "Tonight", mood: "Warm" },
      { title: "Studio Windows", kind: "Open spaces", place: "Remote", time: "All night", mood: "Curious" },
    ],
    opportunities: [
      { title: "Translocal visual archive", creator: "Novera Editions", need: "Image makers", deadline: "Open" },
      { title: "City sound exchange", creator: "Scene Network", need: "Musicians", deadline: "Weekly" },
    ],
    audio: { title: "Night Lines", artist: "Various Scenes", context: "Selections across cities", length: "18:22" },
  },
};

// Laravel discovery API boundary: replace these ambient transmissions with
// paginated city activity data when live presence is enabled.
export const MOCK_ACTIVITY_FEED: Record<CityId, AmbientActivity[]> = {
  rome: [
    { actor: "Alba Forma", action: "started a listening session", place: "Ostiense", time: "now", kind: "session" },
    { actor: "Cava Studio", action: "posted a collaboration request", place: "San Lorenzo", time: "4m", kind: "collaboration" },
    { actor: "Neri Luce", action: "uploaded new moving-image work", place: "Pigneto", time: "12m", kind: "work" },
    { actor: "Riva Ensemble", action: "joined the Rome scene", place: "Trastevere", time: "18m", kind: "arrival" },
  ],
  barcelona: [
    { actor: "Mar Blava", action: "opened a listening room", place: "Raval", time: "now", kind: "room" },
    { actor: "Playa Assembly", action: "is recruiting movement artists", place: "Montjuic", time: "6m", kind: "collective" },
    { actor: "Llum Studio", action: "uploaded a coastal installation", place: "Poblenou", time: "14m", kind: "work" },
    { actor: "Sora", action: "joined the Barcelona scene", place: "Gracia", time: "22m", kind: "arrival" },
  ],
  berlin: [
    { actor: "Null Raum", action: "started a low-frequency session", place: "Neukolln", time: "now", kind: "session" },
    { actor: "Raster Haus", action: "posted a collaboration request", place: "Friedrichshain", time: "5m", kind: "collaboration" },
    { actor: "Kanal Sound", action: "opened a room", place: "Wedding", time: "13m", kind: "room" },
    { actor: "Mira K", action: "joined the Berlin scene", place: "Kreuzberg", time: "24m", kind: "arrival" },
  ],
  copenhagen: [
    { actor: "Signe Vale", action: "opened a listening room", place: "Vesterbro", time: "now", kind: "room" },
    { actor: "North Room", action: "is recruiting a composer", place: "Refshaleoen", time: "7m", kind: "collective" },
    { actor: "Line Archive", action: "uploaded a material study", place: "Norrebro", time: "16m", kind: "work" },
    { actor: "Edda", action: "joined the Copenhagen scene", place: "Harbor", time: "25m", kind: "arrival" },
  ],
  bari: [
    { actor: "Duna", action: "started a harbor listening session", place: "Porto", time: "now", kind: "session" },
    { actor: "Levante Lab", action: "posted an open collaboration", place: "Madonnella", time: "5m", kind: "collaboration" },
    { actor: "Porto Aperto", action: "opened a sound walk room", place: "Murat", time: "11m", kind: "room" },
    { actor: "Ada Mare", action: "joined the Bari scene", place: "Lungomare", time: "20m", kind: "arrival" },
  ],
  default: [
    { actor: "Scene Network", action: "opened a connected listening room", place: "Europe", time: "now", kind: "room" },
    { actor: "Novera Editions", action: "posted a collaboration request", place: "Global", time: "3m", kind: "collaboration" },
    { actor: "Various Scenes", action: "uploaded new work", place: "5 cities", time: "9m", kind: "work" },
    { actor: "Forma", action: "joined the global scene", place: "Remote", time: "17m", kind: "arrival" },
  ],
};
