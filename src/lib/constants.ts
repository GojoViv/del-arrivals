export const DEL_LAT = 28.5562;
export const DEL_LON = 77.1;
export const DEL_ICAO = "VIDP";
export const DEL_IATA = "DEL";

export const MAX_DISTANCE_KM = 8000;
export const MIN_ALTITUDE_M = 300;
export const HEADING_TOLERANCE_DEG = 90;

export const REFRESH_INTERVAL_MS = 30_000;
export const SCHEDULE_REFRESH_MS = 600_000;

export const INDIAN_PREFIXES = [
  "AI",
  "6E",
  "SG",
  "UK",
  "G8",
  "QP",
  "I5",
  "S5",
  "IX",
  "2T",
  "8D",
];

export const AIRLINE_NAMES: Record<string, string> = {
  AI: "Air India",
  "6E": "IndiGo",
  SG: "SpiceJet",
  UK: "Vistara",
  G8: "Go First",
  QP: "Akasa Air",
  I5: "Air India Express",
  IX: "Air India Express",
  EK: "Emirates",
  EY: "Etihad",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
  LH: "Lufthansa",
  BA: "British Airways",
  AF: "Air France",
  KL: "KLM",
  SQ: "Singapore Airlines",
  TG: "Thai Airways",
  CX: "Cathay Pacific",
  MH: "Malaysia Airlines",
  SV: "Saudia",
  UL: "SriLankan Airlines",
  FZ: "Flydubai",
  WY: "Oman Air",
  GF: "Gulf Air",
  KU: "Kuwait Airways",
  WS: "WestJet",
  AC: "Air Canada",
  UA: "United Airlines",
  AA: "American Airlines",
  DL: "Delta Air Lines",
  LO: "LOT Polish",
  OS: "Austrian Airlines",
  AZ: "ITA Airways",
  SK: "SAS",
  AY: "Finnair",
  NH: "ANA",
  JL: "Japan Airlines",
  OZ: "Asiana Airlines",
  KE: "Korean Air",
  CA: "Air China",
  MU: "China Eastern",
  CZ: "China Southern",
  HU: "Hainan Airlines",
  ET: "Ethiopian Airlines",
  MS: "EgyptAir",
  RJ: "Royal Jordanian",
  PK: "PIA",
  BG: "Biman Bangladesh",
  RA: "Nepal Airlines",
  KB: "Druk Air",
  "9W": "Jet Airways",
  "2T": "TruJet",
  S5: "Star Air",
  "8D": "FitsAir",
};
