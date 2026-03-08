import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";
import {
  processAirLabsFlights,
  processOpenSkyStates,
} from "@/lib/flight-processor";
import { Flight, ScheduleEntry } from "@/lib/types";

const CACHE_KEY = "flights";
const CACHE_TTL = 60_000; // 60s
const SCHEDULE_CACHE_KEY = "schedules_for_flights";

interface CachedFlights {
  flights: Flight[];
  timestamp: string;
  source: string;
}

export async function GET() {
  const cached = getCached<CachedFlights>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }

  const schedules = getCached<ScheduleEntry[]>(SCHEDULE_CACHE_KEY) || [];

  // Try AirLabs first
  const airLabsKey = process.env.AIRLABS_API_KEY;
  if (airLabsKey) {
    try {
      const res = await fetch(
        `https://airlabs.co/api/v9/flights?arr_icao=VIDP&api_key=${airLabsKey}`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.response?.length) {
          const flights = processAirLabsFlights(data.response, schedules);
          const result: CachedFlights = {
            flights,
            timestamp: new Date().toISOString(),
            source: "airlabs",
          };
          setCache(CACHE_KEY, result, CACHE_TTL);
          return NextResponse.json(result);
        }
      }
    } catch {
      // fall through to OpenSky
    }
  }

  // Fallback: OpenSky
  try {
    // Bounding box roughly covering 8000km radius around DEL
    const res = await fetch(
      "https://opensky-network.org/api/states/all?lamin=-10&lomin=30&lamax=65&lomax=130",
      { signal: AbortSignal.timeout(15_000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.states?.length) {
        const flights = processOpenSkyStates(data.states, schedules);
        const result: CachedFlights = {
          flights,
          timestamp: new Date().toISOString(),
          source: "opensky",
        };
        setCache(CACHE_KEY, result, CACHE_TTL);
        return NextResponse.json(result);
      }
    }
  } catch {
    // fall through
  }

  return NextResponse.json(
    {
      flights: [],
      timestamp: new Date().toISOString(),
      source: "none",
      error: "Could not reach flight data providers",
    },
    { status: 503 }
  );
}
