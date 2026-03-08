import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";
import { ScheduleEntry } from "@/lib/types";

const CACHE_KEY = "schedules";
const FLIGHTS_SCHEDULE_KEY = "schedules_for_flights";
const CACHE_TTL = 600_000; // 10 minutes

export async function GET() {
  const cached = getCached<ScheduleEntry[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({
      schedules: cached,
      timestamp: new Date().toISOString(),
    });
  }

  const airLabsKey = process.env.AIRLABS_API_KEY;
  if (airLabsKey) {
    try {
      const res = await fetch(
        `https://airlabs.co/api/v9/schedules?arr_iata=DEL&api_key=${airLabsKey}`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.response?.length) {
          const schedules: ScheduleEntry[] = data.response;
          setCache(CACHE_KEY, schedules, CACHE_TTL);
          setCache(FLIGHTS_SCHEDULE_KEY, schedules, CACHE_TTL);
          return NextResponse.json({
            schedules,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // fall through
    }
  }

  // Fallback: AviationStack
  const avKey = process.env.AVIATIONSTACK_API_KEY;
  if (avKey) {
    try {
      const res = await fetch(
        `https://api.aviationstack.com/v1/flights?arr_iata=DEL&access_key=${avKey}&flight_status=active`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.data?.length) {
          const schedules: ScheduleEntry[] = data.data.map(
            (f: Record<string, Record<string, string>>) => ({
              flight_iata: f.flight?.iata || "",
              airline_iata: f.airline?.iata || "",
              dep_iata: f.departure?.iata || "",
              arr_time: f.arrival?.scheduled || "",
              status: f.flight_status || "",
              delayed: f.arrival?.delay ? parseInt(f.arrival.delay) : undefined,
            })
          );
          setCache(CACHE_KEY, schedules, CACHE_TTL);
          setCache(FLIGHTS_SCHEDULE_KEY, schedules, CACHE_TTL);
          return NextResponse.json({
            schedules,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.json({
    schedules: [],
    timestamp: new Date().toISOString(),
    error: "No schedule data available",
  });
}
