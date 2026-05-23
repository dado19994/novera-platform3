import type { CityId } from "@/lib/city-media";

export interface CulturalMoment {
  title: string;
  kind: string;
  place: string;
  time: string;
  mood: string;
  format: string;
  action: "Listen" | "View" | "Join" | "Collaborate" | "Enter room";
  artists: string[];
  audio: boolean;
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
      { title: "Ruins in Frequency", kind: "Listening session", place: "Ostiense", time: "21:30", mood: "Textural", format: "Spatial audio", action: "Enter room", artists: ["AF", "LV", "MS"], audio: true },
      { title: "Afterlight Studies", kind: "Moving image", place: "Pigneto", time: "22:00", mood: "Intimate", format: "16mm film", action: "View", artists: ["NL", "FA"], audio: false },
      { title: "Courtyard Resonance", kind: "Live set", place: "San Lorenzo", time: "23:15", mood: "Warm", format: "Live sound", action: "Listen", artists: ["RE", "DU", "AM"], audio: true },
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
      { title: "Tidal Rooms", kind: "Installation", place: "Poblenou", time: "20:45", mood: "Luminous", format: "Light work", action: "View", artists: ["LB", "PT"], audio: false },
      { title: "Salt Air Tapes", kind: "Live recording", place: "Raval", time: "22:30", mood: "Loose", format: "Live audio", action: "Listen", artists: ["MB", "SO", "FX"], audio: true },
      { title: "Azotea Motion", kind: "Performance", place: "Gracia", time: "23:00", mood: "Electric", format: "Movement", action: "Join", artists: ["PA", "LR"], audio: false },
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
      { title: "Pressure System", kind: "AV work", place: "Friedrichshain", time: "23:40", mood: "Dense", format: "Live AV", action: "View", artists: ["NR", "RH", "KK"], audio: true },
      { title: "Grey Room Editions", kind: "Open studio", place: "Wedding", time: "19:00", mood: "Quiet", format: "Print", action: "Join", artists: ["GE", "MK"], audio: false },
      { title: "Subfloor Dialogue", kind: "Listening", place: "Neukolln", time: "00:20", mood: "Deep", format: "Audio room", action: "Listen", artists: ["NS", "KS"], audio: true },
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
      { title: "Blue Hour Forms", kind: "Installation", place: "Refshaleoen", time: "20:00", mood: "Clear", format: "Light art", action: "View", artists: ["SV", "NR"], audio: false },
      { title: "Quiet Current", kind: "Listening", place: "Vesterbro", time: "21:15", mood: "Still", format: "Hi-fi room", action: "Listen", artists: ["SG", "VL"], audio: true },
      { title: "Paper and Frost", kind: "Studio", place: "Norrebro", time: "18:30", mood: "Minimal", format: "Material", action: "Join", artists: ["LA", "ED"], audio: false },
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
      { title: "Stone and Salt", kind: "Film score", place: "Madonnella", time: "21:00", mood: "Tender", format: "Score", action: "Collaborate", artists: ["DL", "AL"], audio: true },
      { title: "Port Light", kind: "Listening", place: "Porto", time: "22:10", mood: "Open", format: "Sound walk", action: "Listen", artists: ["DU", "PA", "LM"], audio: true },
      { title: "Linea Calda", kind: "Exhibition", place: "Murat", time: "19:30", mood: "Sunlit", format: "Image", action: "View", artists: ["LL", "AM"], audio: false },
    ],
    opportunities: [
      { title: "Sea-front short film", creator: "Levante Lab", need: "Composer", deadline: "3 days" },
      { title: "Community sound walk", creator: "Porto Aperto", need: "Field audio", deadline: "Open" },
    ],
    audio: { title: "Molo Lento", artist: "Duna", context: "Harbor textures after rain", length: "04:03" },
  },
  london: {
    mapNodes: [
      { label: "Shoreditch", type: "Live AV", strength: 82, x: 55, y: 38, state: "live now", activity: "AV room packed" },
      { label: "Peckham", type: "Audio", strength: 71, x: 38, y: 59, state: "listening room", activity: "38 tuned in" },
      { label: "Dalston", type: "Performance", strength: 65, x: 64, y: 26, state: "open call", activity: "Sound system needed" },
    ],
    livePulse: [
      { label: "Artists active now", value: 142, detail: "+9 since midnight" },
      { label: "Collectives recruiting", value: 11, detail: "Club / AV focus" },
      { label: "Events starting soon", value: 16, detail: "East London surge" },
      { label: "Audio rooms live", value: 9, detail: "Bass-heavy sessions" },
    ],
    matchedSignals: [
      { label: "Club electronics", detail: "Peckham after-hours", confidence: "Strong match" },
      { label: "Warehouse AV", detail: "Shoreditch cluster", confidence: "Live now" },
      { label: "Sound system", detail: "Dalston open call", confidence: "Tonight" },
    ],
    tonight: [
      { title: "Signal Descent", kind: "Live AV", place: "Shoreditch", time: "22:00", mood: "Dense", format: "Live AV", action: "View", artists: ["DG", "KW", "ML"], audio: true },
      { title: "Rave Cartography", kind: "Club set", place: "Peckham", time: "23:30", mood: "Electric", format: "DJ set", action: "Listen", artists: ["SS", "PK"], audio: true },
      { title: "Vinyl Archive", kind: "Listening", place: "Dalston", time: "21:00", mood: "Warm", format: "Audio room", action: "Enter room", artists: ["TM", "NE"], audio: true },
    ],
    opportunities: [
      { title: "Graphic artist for rave prints", creator: "East Bloc", need: "Visual artist", deadline: "Fri" },
      { title: "Sound system collaborator", creator: "Pressure Sound", need: "Engineer", deadline: "Open" },
    ],
    audio: { title: "East Hours", artist: "Dusk Grid", context: "A warehouse night study", length: "05:34" },
  },
  paris: {
    mapNodes: [
      { label: "Belleville", type: "Photography", strength: 74, x: 42, y: 33, state: "studio open", activity: "Gallery open" },
      { label: "Saint-Denis", type: "Audio", strength: 80, x: 61, y: 52, state: "live now", activity: "Night session" },
      { label: "Oberkampf", type: "Performance", strength: 68, x: 29, y: 61, state: "open call", activity: "Dancer needed" },
    ],
    livePulse: [
      { label: "Artists active now", value: 138, detail: "Late arrivals rising" },
      { label: "Collectives recruiting", value: 10, detail: "Fashion / motion" },
      { label: "Events starting soon", value: 14, detail: "Belleville cluster" },
      { label: "Audio rooms live", value: 7, detail: "Electronic sessions" },
    ],
    matchedSignals: [
      { label: "Club electronics", detail: "Saint-Denis night", confidence: "High affinity" },
      { label: "Fashion image", detail: "Belleville open", confidence: "Nearby" },
      { label: "Body movement", detail: "Oberkampf call", confidence: "New" },
    ],
    tonight: [
      { title: "Neon Meridian", kind: "Club performance", place: "Saint-Denis", time: "23:00", mood: "Fevered", format: "Live AV", action: "View", artists: ["JL", "RF", "AI"], audio: true },
      { title: "Rue Lumiere", kind: "Photo series", place: "Belleville", time: "19:30", mood: "Golden", format: "Exhibition", action: "View", artists: ["CM", "VB"], audio: false },
      { title: "Corps et Son", kind: "Dance work", place: "Oberkampf", time: "21:45", mood: "Taut", format: "Performance", action: "Join", artists: ["NP", "LO"], audio: false },
    ],
    opportunities: [
      { title: "Photographer for label artwork", creator: "Seine Records", need: "Photography", deadline: "3 days" },
      { title: "VJ for residency", creator: "Club Nuit", need: "Visual artist", deadline: "Open" },
    ],
    audio: { title: "Quai Nocturne", artist: "Fleuve", context: "Recorded along the canal at 3am", length: "04:47" },
  },
  amsterdam: {
    mapNodes: [
      { label: "Amsterdam Noord", type: "Studio", strength: 79, x: 46, y: 28, state: "studio open", activity: "Residency open" },
      { label: "De Pijp", type: "Gallery", strength: 61, x: 30, y: 58, state: "open call", activity: "Group show" },
      { label: "Oost", type: "Audio", strength: 86, x: 66, y: 47, state: "live now", activity: "44 listening" },
    ],
    livePulse: [
      { label: "Artists active now", value: 119, detail: "Canal-side cluster" },
      { label: "Collectives recruiting", value: 8, detail: "3 open residencies" },
      { label: "Events starting soon", value: 13, detail: "Noord leads" },
      { label: "Audio rooms live", value: 6, detail: "Spatial audio" },
    ],
    matchedSignals: [
      { label: "Electronic experiments", detail: "Oost listening room", confidence: "Strong match" },
      { label: "Residency", detail: "Noord studio open", confidence: "Relevant" },
      { label: "Group exhibition", detail: "De Pijp call", confidence: "Nearby" },
    ],
    tonight: [
      { title: "Canal Frequencies", kind: "Listening session", place: "Oost", time: "21:30", mood: "Still", format: "Spatial audio", action: "Enter room", artists: ["BR", "VN", "HS"], audio: true },
      { title: "Noord Factory", kind: "Open studio", place: "Amsterdam Noord", time: "18:00", mood: "Industrial", format: "Residency open", action: "Join", artists: ["KF", "PD"], audio: false },
      { title: "Flat Light", kind: "Group exhibition", place: "De Pijp", time: "20:00", mood: "Diffuse", format: "Mixed media", action: "View", artists: ["EM", "TS", "LV"], audio: false },
    ],
    opportunities: [
      { title: "Sound designer for film", creator: "Dam Films", need: "Sound design", deadline: "2 weeks" },
      { title: "Muralist for outdoor wall", creator: "Straat Museum", need: "Mural artist", deadline: "Open" },
    ],
    audio: { title: "Gracht Sessions", artist: "Nevel", context: "Recorded on a canal boat at dusk", length: "05:02" },
  },
  lisbon: {
    mapNodes: [
      { label: "Mouraria", type: "Sound", strength: 83, x: 38, y: 44, state: "live now", activity: "Fado reimagined" },
      { label: "LX Factory", type: "Performance", strength: 71, x: 57, y: 62, state: "open call", activity: "Collective forming" },
      { label: "Intendente", type: "Gallery", strength: 64, x: 24, y: 34, state: "studio open", activity: "Doors open" },
    ],
    livePulse: [
      { label: "Artists active now", value: 97, detail: "Warm night forming" },
      { label: "Collectives recruiting", value: 6, detail: "Sound / image" },
      { label: "Events starting soon", value: 11, detail: "Mouraria pulse" },
      { label: "Audio rooms live", value: 5, detail: "Fado + electronics" },
    ],
    matchedSignals: [
      { label: "Contemporary fado", detail: "Mouraria session tonight", confidence: "High affinity" },
      { label: "Collective formation", detail: "LX Factory open call", confidence: "Relevant" },
      { label: "Photography", detail: "Intendente studio", confidence: "Nearby" },
    ],
    tonight: [
      { title: "Vozes Novas", kind: "Live session", place: "Mouraria", time: "22:00", mood: "Tender", format: "Live audio", action: "Listen", artists: ["MF", "TG", "AL"], audio: true },
      { title: "Fabrica Aberta", kind: "Open collective", place: "LX Factory", time: "19:00", mood: "Open", format: "Meeting", action: "Join", artists: ["RC", "DP"], audio: false },
      { title: "Azulejo Studies", kind: "Exhibition", place: "Intendente", time: "18:30", mood: "Calm", format: "Photography", action: "View", artists: ["IL", "NF"], audio: false },
    ],
    opportunities: [
      { title: "Score for fado short film", creator: "Tejo Sound", need: "Composer", deadline: "5 days" },
      { title: "Tile mural documentation", creator: "Lisboa Viva", need: "Photographer", deadline: "Open" },
    ],
    audio: { title: "Colina ao Anoitecer", artist: "Mara Fado", context: "Hillside evening session", length: "04:19" },
  },
  dublin: {
    mapNodes: [
      { label: "Smithfield", type: "Audio", strength: 58, x: 34, y: 40, state: "listening room", activity: "22 tuned in" },
      { label: "Stoneybatter", type: "Performance", strength: 72, x: 52, y: 57, state: "live now", activity: "Venue full" },
      { label: "Liberties", type: "Gallery", strength: 67, x: 41, y: 68, state: "studio open", activity: "Print studio" },
    ],
    livePulse: [
      { label: "Artists active now", value: 76, detail: "Evening gathering" },
      { label: "Collectives recruiting", value: 6, detail: "Music / print" },
      { label: "Events starting soon", value: 9, detail: "Stoneybatter set" },
      { label: "Audio rooms live", value: 4, detail: "Ambient rooms" },
    ],
    matchedSignals: [
      { label: "Indie electronics", detail: "Smithfield room", confidence: "Nearby" },
      { label: "Print collective", detail: "Liberties studio open", confidence: "Tonight" },
      { label: "Live performance", detail: "Stoneybatter venue", confidence: "Now" },
    ],
    tonight: [
      { title: "Liffey Drone", kind: "Ambient set", place: "Smithfield", time: "21:00", mood: "Misty", format: "Audio room", action: "Enter room", artists: ["CM", "LO"], audio: true },
      { title: "North Quarter", kind: "Live set", place: "Stoneybatter", time: "22:30", mood: "Rough", format: "Live sound", action: "Listen", artists: ["SR", "DF", "GK"], audio: true },
      { title: "Offset Print Night", kind: "Studio", place: "Liberties", time: "19:00", mood: "Quiet", format: "Print", action: "Join", artists: ["PO", "MM"], audio: false },
    ],
    opportunities: [
      { title: "Composer for dance work", creator: "Fringe Dance", need: "Composer", deadline: "End of week" },
      { title: "Riso print collaborator", creator: "Folio Press", need: "Illustrator", deadline: "Open" },
    ],
    audio: { title: "Grey Matter", artist: "River Run", context: "Recorded in a Smithfield warehouse", length: "04:55" },
  },
  prague: {
    mapNodes: [
      { label: "Zizkov", type: "Studio", strength: 75, x: 58, y: 35, state: "studio open", activity: "Editions viewing" },
      { label: "Holesovice", type: "Performance", strength: 81, x: 43, y: 51, state: "live now", activity: "Full house" },
      { label: "Karlin", type: "Gallery", strength: 63, x: 29, y: 65, state: "open call", activity: "2 artists needed" },
    ],
    livePulse: [
      { label: "Artists active now", value: 104, detail: "Post-midnight scene" },
      { label: "Collectives recruiting", value: 9, detail: "AV / image" },
      { label: "Events starting soon", value: 12, detail: "Holesovice first" },
      { label: "Audio rooms live", value: 7, detail: "Electronic sets" },
    ],
    matchedSignals: [
      { label: "Industrial AV", detail: "Holesovice live", confidence: "Strong match" },
      { label: "Print studio", detail: "Zizkov editions", confidence: "Tonight" },
      { label: "Gallery open call", detail: "Karlin group show", confidence: "Relevant" },
    ],
    tonight: [
      { title: "Heavy Crane", kind: "AV performance", place: "Holesovice", time: "22:45", mood: "Hard", format: "Live AV", action: "View", artists: ["JN", "PK", "VO"], audio: true },
      { title: "Studio Editions", kind: "Open studio", place: "Zizkov", time: "18:30", mood: "Still", format: "Print", action: "Join", artists: ["AD", "BF"], audio: false },
      { title: "Refracted Forms", kind: "Group show", place: "Karlin", time: "20:00", mood: "Geometric", format: "Mixed media", action: "View", artists: ["MH", "IK"], audio: false },
    ],
    opportunities: [
      { title: "Sound for video installation", creator: "Praga Works", need: "Sound designer", deadline: "Jun 10" },
      { title: "Residency photographer", creator: "Karlin Gallery", need: "Photography", deadline: "Open" },
    ],
    audio: { title: "Molten Shift", artist: "Dusno", context: "Factory floor session, late take", length: "06:12" },
  },
  bologna: {
    mapNodes: [
      { label: "Bolognina", type: "Audio", strength: 70, x: 44, y: 37, state: "listening room", activity: "31 listening" },
      { label: "Zona Universitaria", type: "Performance", strength: 77, x: 59, y: 55, state: "live now", activity: "Stage set" },
      { label: "Santo Stefano", type: "Gallery", strength: 62, x: 27, y: 61, state: "studio open", activity: "Works on view" },
    ],
    livePulse: [
      { label: "Artists active now", value: 88, detail: "Student surge" },
      { label: "Collectives recruiting", value: 7, detail: "Academic + street" },
      { label: "Events starting soon", value: 10, detail: "University district" },
      { label: "Audio rooms live", value: 5, detail: "Listening sessions" },
    ],
    matchedSignals: [
      { label: "Academic electronics", detail: "Bolognina session", confidence: "Near you" },
      { label: "Live performance", detail: "Zona Universitaria", confidence: "Tonight" },
      { label: "Gallery open", detail: "Santo Stefano viewing", confidence: "Relevant" },
    ],
    tonight: [
      { title: "Torri Sonore", kind: "Listening session", place: "Bolognina", time: "21:00", mood: "Dense", format: "Audio room", action: "Enter room", artists: ["GV", "AR", "EM"], audio: true },
      { title: "Piazza Aperta", kind: "Live performance", place: "Zona Universitaria", time: "22:30", mood: "Raw", format: "Outdoor set", action: "Listen", artists: ["FC", "BL"], audio: true },
      { title: "Luce Rossa", kind: "Exhibition", place: "Santo Stefano", time: "18:00", mood: "Warm", format: "Painting", action: "View", artists: ["MP", "SG"], audio: false },
    ],
    opportunities: [
      { title: "Score for student film", creator: "DAMS Cinema", need: "Composer", deadline: "4 days" },
      { title: "Graphic design for festival", creator: "Crossroads Fest", need: "Designer", deadline: "Open" },
    ],
    audio: { title: "Sotto i Portici", artist: "Arco Studio", context: "Recorded under the arcades at night", length: "04:31" },
  },
  pag: {
    mapNodes: [
      { label: "Zrce Beach", type: "Festival", strength: 93, x: 50, y: 40, state: "live now", activity: "Main stage live" },
      { label: "Novalja", type: "Club", strength: 88, x: 32, y: 58, state: "live now", activity: "Packed floors" },
      { label: "Pag Town", type: "Ambient", strength: 55, x: 67, y: 25, state: "listening room", activity: "Chill room" },
    ],
    livePulse: [
      { label: "Artists active now", value: 220, detail: "Peak night energy" },
      { label: "Collectives recruiting", value: 14, detail: "Festival crews" },
      { label: "Events starting soon", value: 22, detail: "Zrce lineup" },
      { label: "Audio rooms live", value: 11, detail: "Outdoor stages" },
    ],
    matchedSignals: [
      { label: "Techno festival", detail: "Zrce main stage", confidence: "Live now" },
      { label: "Club night", detail: "Novalja venues open", confidence: "Strong match" },
      { label: "Ambient room", detail: "Pag Town chill", confidence: "Tonight" },
    ],
    tonight: [
      { title: "Adriatic Surge", kind: "Festival set", place: "Zrce Beach", time: "00:00", mood: "Peak", format: "Outdoor stage", action: "Listen", artists: ["DJ-AX", "KV", "PN"], audio: true },
      { title: "Salt Floor", kind: "Club night", place: "Novalja", time: "22:00", mood: "Relentless", format: "Club set", action: "Listen", artists: ["TC", "BE"], audio: true },
      { title: "Morning Tide", kind: "Ambient", place: "Pag Town", time: "04:00", mood: "Soft", format: "Audio room", action: "Enter room", artists: ["FW", "LN"], audio: true },
    ],
    opportunities: [
      { title: "Festival visual artist", creator: "Zrce Productions", need: "Visual artist", deadline: "Immediate" },
      { title: "Stage photographer", creator: "Adriatic Beats", need: "Photography", deadline: "Tonight" },
    ],
    audio: { title: "White Island", artist: "Adriatic Crew", context: "Festival sunrise recording", length: "07:18" },
  },
  athens: {
    mapNodes: [
      { label: "Exarchia", type: "Art collective", strength: 78, x: 37, y: 36, state: "open call", activity: "Mural project" },
      { label: "Keramikos", type: "Club", strength: 84, x: 54, y: 54, state: "live now", activity: "Floor opening" },
      { label: "Monastiraki", type: "Cultural", strength: 61, x: 66, y: 40, state: "studio open", activity: "Archive open" },
    ],
    livePulse: [
      { label: "Artists active now", value: 112, detail: "Mediterranean heat" },
      { label: "Collectives recruiting", value: 9, detail: "Activist art focus" },
      { label: "Events starting soon", value: 13, detail: "Keramikos district" },
      { label: "Audio rooms live", value: 6, detail: "Club sessions" },
    ],
    matchedSignals: [
      { label: "Club underground", detail: "Keramikos night", confidence: "High affinity" },
      { label: "Mural collective", detail: "Exarchia open call", confidence: "Relevant" },
      { label: "Archive project", detail: "Monastiraki studio", confidence: "Nearby" },
    ],
    tonight: [
      { title: "Marble Flux", kind: "Club night", place: "Keramikos", time: "23:30", mood: "Intense", format: "Club set", action: "Listen", artists: ["AK", "DR", "GX"], audio: true },
      { title: "Anarchy Prints", kind: "Open studio", place: "Exarchia", time: "19:00", mood: "Raw", format: "Collective work", action: "Join", artists: ["YP", "NM"], audio: false },
      { title: "Ancient Futures", kind: "Archive session", place: "Monastiraki", time: "20:30", mood: "Reflective", format: "Mixed media", action: "View", artists: ["EK", "PT"], audio: false },
    ],
    opportunities: [
      { title: "Mural for community wall", creator: "Exarchia Walls", need: "Mural artist", deadline: "Open" },
      { title: "DJ for underground night", creator: "Ker Club", need: "DJ / selector", deadline: "This week" },
    ],
    audio: { title: "Agora Night", artist: "Kyma", context: "Rooftop session under Acropolis", length: "05:23" },
  },
  warsaw: {
    mapNodes: [
      { label: "Praga", type: "Studio", strength: 76, x: 48, y: 35, state: "studio open", activity: "Print studio" },
      { label: "Muranow", type: "Gallery", strength: 64, x: 31, y: 52, state: "open call", activity: "Group show forming" },
      { label: "Srodmiescie", type: "Performance", strength: 81, x: 62, y: 60, state: "live now", activity: "Sold out" },
    ],
    livePulse: [
      { label: "Artists active now", value: 101, detail: "Post-Soviet energy" },
      { label: "Collectives recruiting", value: 8, detail: "Film / performance" },
      { label: "Events starting soon", value: 12, detail: "Centre district" },
      { label: "Audio rooms live", value: 6, detail: "Electronic rooms" },
    ],
    matchedSignals: [
      { label: "Electronic performance", detail: "Srodmiescie live", confidence: "Strong match" },
      { label: "Print collective", detail: "Praga studio", confidence: "Tonight" },
      { label: "Gallery open call", detail: "Muranow group show", confidence: "New" },
    ],
    tonight: [
      { title: "Konstrukty", kind: "Live performance", place: "Srodmiescie", time: "22:00", mood: "Stark", format: "Live AV", action: "View", artists: ["MK", "AW", "JZ"], audio: true },
      { title: "Neon Risograph", kind: "Print studio", place: "Praga", time: "18:30", mood: "Playful", format: "Print", action: "Join", artists: ["KN", "BL"], audio: false },
      { title: "Pami Collective", kind: "Group show", place: "Muranow", time: "20:00", mood: "Heavy", format: "Mixed media", action: "View", artists: ["TP", "GH"], audio: false },
    ],
    opportunities: [
      { title: "Video artist for installation", creator: "Praga Fabrika", need: "Video artist", deadline: "Jun 14" },
      { title: "Composer for dance film", creator: "Taniec Studio", need: "Composer", deadline: "Open" },
    ],
    audio: { title: "Betonowy Sen", artist: "Szum", context: "Concrete bunker session", length: "05:47" },
  },
  budapest: {
    mapNodes: [
      { label: "District VII", type: "Club", strength: 88, x: 52, y: 45, state: "live now", activity: "Ruin bars packed" },
      { label: "Corvin", type: "Performance", strength: 74, x: 37, y: 60, state: "open call", activity: "Choreographer needed" },
      { label: "Buda Hills", type: "Ambient", strength: 57, x: 65, y: 28, state: "listening room", activity: "Twilight session" },
    ],
    livePulse: [
      { label: "Artists active now", value: 124, detail: "Danube energy" },
      { label: "Collectives recruiting", value: 10, detail: "Dance / AV" },
      { label: "Events starting soon", value: 15, detail: "Ruin bar circuit" },
      { label: "Audio rooms live", value: 8, detail: "Cave acoustics" },
    ],
    matchedSignals: [
      { label: "Ruin bar electronics", detail: "District VII scene", confidence: "High affinity" },
      { label: "Contemporary dance", detail: "Corvin open call", confidence: "Relevant" },
      { label: "Ambient listening", detail: "Buda Hills session", confidence: "Quiet" },
    ],
    tonight: [
      { title: "Romkocsma Frequencies", kind: "Club night", place: "District VII", time: "22:00", mood: "Ecstatic", format: "DJ set", action: "Listen", artists: ["BK", "VR", "AF"], audio: true },
      { title: "Body Script", kind: "Dance performance", place: "Corvin", time: "20:30", mood: "Precise", format: "Contemporary dance", action: "View", artists: ["EF", "ZN"], audio: false },
      { title: "Danube Dusk", kind: "Ambient", place: "Buda Hills", time: "19:00", mood: "Tranquil", format: "Audio room", action: "Enter room", artists: ["HW", "IL"], audio: true },
    ],
    opportunities: [
      { title: "Choreographer for collective show", creator: "Corvin Dance", need: "Choreographer", deadline: "3 days" },
      { title: "VJ for ruin bar residency", creator: "Romkocsma Crew", need: "VJ", deadline: "Open" },
    ],
    audio: { title: "Duna Esti", artist: "Harang", context: "Recorded by the river at nightfall", length: "04:44" },
  },
  zagreb: {
    mapNodes: [
      { label: "Medika", type: "Studio", strength: 71, x: 45, y: 39, state: "studio open", activity: "Collective open" },
      { label: "Trnje", type: "Performance", strength: 66, x: 58, y: 57, state: "live now", activity: "Show running" },
      { label: "Upper Town", type: "Gallery", strength: 59, x: 30, y: 52, state: "open call", activity: "Exhibition call" },
    ],
    livePulse: [
      { label: "Artists active now", value: 84, detail: "Adriatic off-season" },
      { label: "Collectives recruiting", value: 7, detail: "Performance / image" },
      { label: "Events starting soon", value: 10, detail: "Trnje district" },
      { label: "Audio rooms live", value: 5, detail: "Indie sessions" },
    ],
    matchedSignals: [
      { label: "Alternative scene", detail: "Medika collective", confidence: "Nearby" },
      { label: "Live performance", detail: "Trnje venue active", confidence: "Tonight" },
      { label: "Open exhibition", detail: "Upper Town call", confidence: "New" },
    ],
    tonight: [
      { title: "Sava Crossing", kind: "Live set", place: "Trnje", time: "22:00", mood: "Gritty", format: "Live sound", action: "Listen", artists: ["DP", "IK", "NV"], audio: true },
      { title: "Kolektiv Open", kind: "Collective meeting", place: "Medika", time: "19:30", mood: "Open", format: "Studio open", action: "Join", artists: ["MR", "AK"], audio: false },
      { title: "Gornji Grad After", kind: "Exhibition", place: "Upper Town", time: "20:00", mood: "Historic", format: "Mixed media", action: "View", artists: ["LB", "SF"], audio: false },
    ],
    opportunities: [
      { title: "Sound artist for video work", creator: "Medika Lab", need: "Sound design", deadline: "Open" },
      { title: "Mural for youth center", creator: "Trnje Commons", need: "Mural artist", deadline: "4 days" },
    ],
    audio: { title: "Sava Snimka", artist: "Forma Zagreb", context: "Field recording by the river", length: "04:08" },
  },
  brussels: {
    mapNodes: [
      { label: "Ixelles", type: "Gallery", strength: 69, x: 40, y: 42, state: "studio open", activity: "Residency viewing" },
      { label: "Molenbeek", type: "Audio", strength: 82, x: 58, y: 58, state: "live now", activity: "Session full" },
      { label: "Saint-Gilles", type: "Performance", strength: 73, x: 26, y: 62, state: "open call", activity: "Ensemble forming" },
    ],
    livePulse: [
      { label: "Artists active now", value: 109, detail: "Multilingual scene" },
      { label: "Collectives recruiting", value: 9, detail: "Diaspora / sound" },
      { label: "Events starting soon", value: 13, detail: "Ixelles cluster" },
      { label: "Audio rooms live", value: 7, detail: "Bass music rooms" },
    ],
    matchedSignals: [
      { label: "Diaspora electronics", detail: "Molenbeek session", confidence: "High affinity" },
      { label: "Ensemble work", detail: "Saint-Gilles call", confidence: "Relevant" },
      { label: "Residency show", detail: "Ixelles gallery", confidence: "Tonight" },
    ],
    tonight: [
      { title: "Bruxelles Bass", kind: "Live session", place: "Molenbeek", time: "22:30", mood: "Heavy", format: "Live audio", action: "Listen", artists: ["SD", "FK", "AM"], audio: true },
      { title: "Ensemble Ouvert", kind: "Collective rehearsal", place: "Saint-Gilles", time: "20:00", mood: "Exploratory", format: "Performance", action: "Join", artists: ["LV", "NB"], audio: false },
      { title: "Residency Survey", kind: "Exhibition", place: "Ixelles", time: "18:30", mood: "Polished", format: "Mixed media", action: "View", artists: ["OT", "MM", "SJ"], audio: false },
    ],
    opportunities: [
      { title: "Vocalist for electronic track", creator: "Molo Records", need: "Vocalist", deadline: "48 hours" },
      { title: "Visual identity for collective", creator: "Commune Art", need: "Designer", deadline: "Open" },
    ],
    audio: { title: "Canal West", artist: "Bruine", context: "Recorded in an Anderlecht warehouse", length: "05:08" },
  },
  vienna: {
    mapNodes: [
      { label: "Naschmarkt", type: "Gallery", strength: 65, x: 44, y: 50, state: "studio open", activity: "Pop-up open" },
      { label: "Ottakring", type: "Audio", strength: 79, x: 29, y: 38, state: "live now", activity: "Electronic set" },
      { label: "Mariahilf", type: "Performance", strength: 72, x: 61, y: 34, state: "open call", activity: "Soloist needed" },
    ],
    livePulse: [
      { label: "Artists active now", value: 96, detail: "Classical + club" },
      { label: "Collectives recruiting", value: 6, detail: "New music focus" },
      { label: "Events starting soon", value: 11, detail: "Ottakring leads" },
      { label: "Audio rooms live", value: 6, detail: "Hybrid sessions" },
    ],
    matchedSignals: [
      { label: "New music", detail: "Mariahilf open call", confidence: "Strong match" },
      { label: "Electronic club", detail: "Ottakring live", confidence: "Tonight" },
      { label: "Pop-up gallery", detail: "Naschmarkt opening", confidence: "Nearby" },
    ],
    tonight: [
      { title: "Nachtleben Drift", kind: "Electronic set", place: "Ottakring", time: "23:00", mood: "Clean", format: "Live set", action: "Listen", artists: ["MV", "RS", "AG"], audio: true },
      { title: "Solo Form", kind: "New music", place: "Mariahilf", time: "20:30", mood: "Precise", format: "Concert", action: "Listen", artists: ["FW", "EH"], audio: true },
      { title: "Wiener Pop-up", kind: "Exhibition", place: "Naschmarkt", time: "18:00", mood: "Curated", format: "Mixed media", action: "View", artists: ["LK", "OM"], audio: false },
    ],
    opportunities: [
      { title: "Soloist for new composition", creator: "Klang Wien", need: "Performer", deadline: "Jun 20" },
      { title: "Graphic artist for program", creator: "Konzerthaus", need: "Designer", deadline: "Open" },
    ],
    audio: { title: "Ringstrasse Nacht", artist: "Nacht Ton", context: "Late session in a converted Beisl", length: "04:52" },
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
      { title: "Connected Nights", kind: "Editorial trail", place: "5 cities", time: "Now", mood: "Global", format: "Trail", action: "View", artists: ["NV", "SC", "FL"], audio: false },
      { title: "Soft Signals", kind: "Audio selections", place: "Europe", time: "Tonight", mood: "Warm", format: "Audio", action: "Listen", artists: ["VS", "SN"], audio: true },
      { title: "Studio Windows", kind: "Open spaces", place: "Remote", time: "All night", mood: "Curious", format: "Open call", action: "Join", artists: ["NE", "FA"], audio: false },
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
  london: [
    { actor: "Dusk Grid", action: "started a warehouse session", place: "Shoreditch", time: "now", kind: "session" },
    { actor: "East Bloc", action: "posted a collaboration request", place: "Hackney", time: "3m", kind: "collaboration" },
    { actor: "Pressure Sound", action: "opened a listening room", place: "Peckham", time: "11m", kind: "room" },
    { actor: "Kaya", action: "joined the London scene", place: "Dalston", time: "19m", kind: "arrival" },
  ],
  paris: [
    { actor: "Fleuve", action: "started a canal-side session", place: "Saint-Denis", time: "now", kind: "session" },
    { actor: "Seine Records", action: "posted a collaboration request", place: "Belleville", time: "5m", kind: "collaboration" },
    { actor: "Club Nuit", action: "opened a VJ residency call", place: "Oberkampf", time: "13m", kind: "collective" },
    { actor: "Ines L.", action: "joined the Paris scene", place: "Pigalle", time: "21m", kind: "arrival" },
  ],
  amsterdam: [
    { actor: "Nevel", action: "started a canal boat session", place: "Oost", time: "now", kind: "session" },
    { actor: "Dam Films", action: "posted a collaboration request", place: "Amsterdam Noord", time: "4m", kind: "collaboration" },
    { actor: "Straat Museum", action: "opened a mural residency", place: "Noord", time: "12m", kind: "collective" },
    { actor: "Bram V.", action: "joined the Amsterdam scene", place: "De Pijp", time: "22m", kind: "arrival" },
  ],
  lisbon: [
    { actor: "Mara Fado", action: "started a hillside session", place: "Mouraria", time: "now", kind: "session" },
    { actor: "Tejo Sound", action: "posted a collaboration request", place: "LX Factory", time: "6m", kind: "collaboration" },
    { actor: "Lisboa Viva", action: "opened a photography call", place: "Intendente", time: "14m", kind: "collective" },
    { actor: "Rui C.", action: "joined the Lisbon scene", place: "Alfama", time: "20m", kind: "arrival" },
  ],
  dublin: [
    { actor: "River Run", action: "started an ambient session", place: "Smithfield", time: "now", kind: "session" },
    { actor: "Fringe Dance", action: "posted a collaboration request", place: "Stoneybatter", time: "5m", kind: "collaboration" },
    { actor: "Folio Press", action: "opened a print studio night", place: "Liberties", time: "10m", kind: "room" },
    { actor: "Ciara M.", action: "joined the Dublin scene", place: "Portobello", time: "18m", kind: "arrival" },
  ],
  prague: [
    { actor: "Dusno", action: "started a factory floor session", place: "Holesovice", time: "now", kind: "session" },
    { actor: "Praga Works", action: "posted a collaboration request", place: "Zizkov", time: "4m", kind: "collaboration" },
    { actor: "Karlin Gallery", action: "opened a residency call", place: "Karlin", time: "11m", kind: "collective" },
    { actor: "Vera N.", action: "joined the Prague scene", place: "Vinohrady", time: "23m", kind: "arrival" },
  ],
  bologna: [
    { actor: "Arco Studio", action: "started an arcade session", place: "Bolognina", time: "now", kind: "session" },
    { actor: "DAMS Cinema", action: "posted a collaboration request", place: "Zona Universitaria", time: "5m", kind: "collaboration" },
    { actor: "Crossroads Fest", action: "opened a design call", place: "Santo Stefano", time: "13m", kind: "collective" },
    { actor: "Giulia V.", action: "joined the Bologna scene", place: "Centro Storico", time: "20m", kind: "arrival" },
  ],
  pag: [
    { actor: "Adriatic Crew", action: "started a sunrise recording session", place: "Zrce Beach", time: "now", kind: "session" },
    { actor: "Zrce Productions", action: "posted a visual artist call", place: "Novalja", time: "2m", kind: "collaboration" },
    { actor: "Adriatic Beats", action: "opened a photographer slot", place: "Zrce Beach", time: "8m", kind: "collective" },
    { actor: "DJ Pavo", action: "joined the Pag scene", place: "Novalja", time: "15m", kind: "arrival" },
  ],
  athens: [
    { actor: "Kyma", action: "started a rooftop session", place: "Keramikos", time: "now", kind: "session" },
    { actor: "Exarchia Walls", action: "posted a mural collaboration", place: "Exarchia", time: "6m", kind: "collaboration" },
    { actor: "Ker Club", action: "opened a DJ residency call", place: "Keramikos", time: "14m", kind: "collective" },
    { actor: "Eleni P.", action: "joined the Athens scene", place: "Koukaki", time: "22m", kind: "arrival" },
  ],
  warsaw: [
    { actor: "Szum", action: "started a bunker session", place: "Srodmiescie", time: "now", kind: "session" },
    { actor: "Praga Fabrika", action: "posted a video artist call", place: "Praga", time: "4m", kind: "collaboration" },
    { actor: "Taniec Studio", action: "opened a composer call", place: "Muranow", time: "12m", kind: "collective" },
    { actor: "Kasia W.", action: "joined the Warsaw scene", place: "Mokotow", time: "21m", kind: "arrival" },
  ],
  budapest: [
    { actor: "Harang", action: "started a river session", place: "District VII", time: "now", kind: "session" },
    { actor: "Corvin Dance", action: "posted a choreographer call", place: "Corvin", time: "5m", kind: "collaboration" },
    { actor: "Romkocsma Crew", action: "opened a VJ residency", place: "District VII", time: "13m", kind: "collective" },
    { actor: "Bence K.", action: "joined the Budapest scene", place: "Buda", time: "20m", kind: "arrival" },
  ],
  zagreb: [
    { actor: "Forma Zagreb", action: "started a riverside session", place: "Trnje", time: "now", kind: "session" },
    { actor: "Medika Lab", action: "posted a sound design call", place: "Medika", time: "6m", kind: "collaboration" },
    { actor: "Trnje Commons", action: "opened a mural project", place: "Trnje", time: "14m", kind: "collective" },
    { actor: "Ana K.", action: "joined the Zagreb scene", place: "Upper Town", time: "19m", kind: "arrival" },
  ],
  brussels: [
    { actor: "Bruine", action: "started a warehouse session", place: "Molenbeek", time: "now", kind: "session" },
    { actor: "Molo Records", action: "posted a vocalist call", place: "Saint-Gilles", time: "4m", kind: "collaboration" },
    { actor: "Commune Art", action: "opened a design call", place: "Ixelles", time: "11m", kind: "collective" },
    { actor: "Lina S.", action: "joined the Brussels scene", place: "Schaerbeek", time: "18m", kind: "arrival" },
  ],
  vienna: [
    { actor: "Nacht Ton", action: "started a Beisl session", place: "Ottakring", time: "now", kind: "session" },
    { actor: "Klang Wien", action: "posted a performer call", place: "Mariahilf", time: "5m", kind: "collaboration" },
    { actor: "Konzerthaus", action: "opened a designer call", place: "Naschmarkt", time: "12m", kind: "collective" },
    { actor: "Felix W.", action: "joined the Vienna scene", place: "Neubau", time: "21m", kind: "arrival" },
  ],
  default: [
    { actor: "Scene Network", action: "opened a connected listening room", place: "Europe", time: "now", kind: "room" },
    { actor: "Novera Editions", action: "posted a collaboration request", place: "Global", time: "3m", kind: "collaboration" },
    { actor: "Various Scenes", action: "uploaded new work", place: "5 cities", time: "9m", kind: "work" },
    { actor: "Forma", action: "joined the global scene", place: "Remote", time: "17m", kind: "arrival" },
  ],
};
