export type DelayStatus = "on_time" | "delayed" | "unknown";

export interface Flight {
  icao24: string;
  callsign: string;
  flightIata: string;
  airline: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  altFt: number;
  speedKts: number;
  heading: number;
  vertRate: number;
  distKm: number;
  etaMinutes: number;
  isInternational: boolean;
  scheduledArrival: string | null;
  delayMinutes: number | null;
  delayStatus: DelayStatus;
}

export interface ScheduleEntry {
  flight_iata: string;
  airline_iata: string;
  dep_iata: string;
  arr_time: string;
  status: string;
  delayed?: number;
}

export interface FlightsResponse {
  flights: Flight[];
  timestamp: string;
  source: string;
  error?: string;
}

export interface ScheduleResponse {
  schedules: ScheduleEntry[];
  timestamp: string;
  error?: string;
}

export interface Stats {
  total: number;
  international: number;
  domestic: number;
  onTime: number;
  delayed: number;
  nextEta: number | null;
}

export type FilterType =
  | "all"
  | "international"
  | "domestic"
  | "on_time"
  | "delayed";
