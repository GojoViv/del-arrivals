import { Flight, ScheduleEntry } from "./types";
import {
  DEL_LAT,
  DEL_LON,
  MAX_DISTANCE_KM,
  INDIAN_PREFIXES,
  AIRLINE_NAMES,
} from "./constants";
import { haversine, etaMinutes } from "./geo";

interface AirLabsFlight {
  hex: string;
  flag: string;
  lat: number;
  lng: number;
  alt: number;
  dir: number;
  speed: number;
  v_speed: number;
  flight_iata: string;
  flight_icao: string;
  dep_iata: string;
  arr_iata: string;
  airline_iata: string;
  status: string;
}

export function processAirLabsFlights(
  raw: AirLabsFlight[],
  schedules: ScheduleEntry[]
): Flight[] {
  const scheduleMap = new Map<string, ScheduleEntry>();
  for (const s of schedules) {
    if (s.flight_iata) {
      scheduleMap.set(s.flight_iata, s);
    }
  }

  const flights: Flight[] = [];

  for (const r of raw) {
    if (!r.lat || !r.lng) continue;

    const distKm = haversine(r.lat, r.lng, DEL_LAT, DEL_LON);
    if (distKm > MAX_DISTANCE_KM) continue;

    const speedKts = (r.speed || 0) * 1.944;
    const eta = etaMinutes(distKm, speedKts);
    const airlineCode = r.airline_iata || r.flight_iata?.slice(0, 2) || "";
    const isInternational = !INDIAN_PREFIXES.includes(airlineCode);

    const schedule = r.flight_iata ? scheduleMap.get(r.flight_iata) : undefined;
    let delayMinutes: number | null = null;
    let delayStatus: Flight["delayStatus"] = "unknown";

    if (schedule?.arr_time) {
      const scheduledMs = parseISTTime(schedule.arr_time);
      const etaMs = Date.now() + eta * 60_000;
      delayMinutes = Math.round((etaMs - scheduledMs) / 60_000);
      if (delayMinutes <= 15) {
        delayStatus = "on_time";
        delayMinutes = Math.max(0, delayMinutes);
      } else {
        delayStatus = "delayed";
      }
    } else if (schedule?.delayed !== undefined) {
      delayMinutes = schedule.delayed;
      delayStatus = delayMinutes > 15 ? "delayed" : "on_time";
    }

    flights.push({
      icao24: r.hex || r.flight_icao || "",
      callsign: r.flight_icao || r.flight_iata || "",
      flightIata: r.flight_iata || "",
      airline: AIRLINE_NAMES[airlineCode] || airlineCode || "Unknown",
      country: r.flag || "",
      countryCode: r.flag || "",
      lat: r.lat,
      lon: r.lng,
      altFt: Math.round((r.alt || 0) * 3.281),
      speedKts: Math.round(speedKts),
      heading: r.dir || 0,
      vertRate: r.v_speed || 0,
      distKm: Math.round(distKm),
      etaMinutes: Math.round(eta),
      isInternational,
      scheduledArrival: schedule?.arr_time || null,
      delayMinutes,
      delayStatus,
    });
  }

  flights.sort((a, b) => a.distKm - b.distKm);
  return flights;
}

function parseISTTime(timeStr: string): number {
  // AirLabs returns local time like "2026-03-08 14:30"
  // DEL is IST (UTC+5:30)
  const d = new Date(timeStr + "+05:30");
  return d.getTime();
}

interface OpenSkyState {
  0: string; // icao24
  1: string; // callsign
  2: string; // origin_country
  5: number; // lon
  6: number; // lat
  7: number; // baro_altitude
  9: number; // velocity
  10: number; // true_track
  11: number; // vertical_rate
}

export function processOpenSkyStates(
  states: OpenSkyState[],
  schedules: ScheduleEntry[]
): Flight[] {
  const flights: Flight[] = [];

  for (const s of states) {
    const lat = s[6];
    const lon = s[5];
    if (!lat || !lon) continue;

    const altM = s[7] || 0;
    const speedMs = s[9] || 0;
    const speedKts = speedMs * 1.944;
    const distKm = haversine(lat, lon, DEL_LAT, DEL_LON);
    if (distKm > MAX_DISTANCE_KM) continue;

    const eta = etaMinutes(distKm, speedKts);
    const callsign = (s[1] || "").trim();
    const airlineCode = callsign.slice(0, 2);
    const isInternational =
      s[2] !== "India" && !INDIAN_PREFIXES.includes(airlineCode);

    // Try to match schedule by callsign prefix
    const schedule = findScheduleByCallsign(callsign, schedules);
    let delayMinutes: number | null = null;
    let delayStatus: Flight["delayStatus"] = "unknown";

    if (schedule?.arr_time) {
      const scheduledMs = parseISTTime(schedule.arr_time);
      const etaMs = Date.now() + eta * 60_000;
      delayMinutes = Math.round((etaMs - scheduledMs) / 60_000);
      delayStatus = delayMinutes <= 15 ? "on_time" : "delayed";
      if (delayStatus === "on_time") delayMinutes = Math.max(0, delayMinutes);
    }

    flights.push({
      icao24: s[0],
      callsign,
      flightIata: schedule?.flight_iata || callsign,
      airline: AIRLINE_NAMES[airlineCode] || s[2] || "Unknown",
      country: s[2] || "",
      countryCode: "",
      lat,
      lon,
      altFt: Math.round(altM * 3.281),
      speedKts: Math.round(speedKts),
      heading: s[10] || 0,
      vertRate: s[11] || 0,
      distKm: Math.round(distKm),
      etaMinutes: Math.round(eta),
      isInternational,
      scheduledArrival: schedule?.arr_time || null,
      delayMinutes,
      delayStatus,
    });
  }

  flights.sort((a, b) => a.distKm - b.distKm);
  return flights;
}

function findScheduleByCallsign(
  callsign: string,
  schedules: ScheduleEntry[]
): ScheduleEntry | undefined {
  // ICAO callsigns like "AIC302" -> flight_iata "AI302"
  // Try direct match first
  for (const s of schedules) {
    if (s.flight_iata && callsign.includes(s.flight_iata.replace(/\s/g, ""))) {
      return s;
    }
  }
  return undefined;
}
