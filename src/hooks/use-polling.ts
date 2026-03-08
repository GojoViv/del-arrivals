"use client";

import { useEffect, useRef } from "react";
import { useFlightStore } from "./use-flight-store";
import { REFRESH_INTERVAL_MS, SCHEDULE_REFRESH_MS } from "@/lib/constants";

export function useFlightPolling() {
  const { setFlights, setError, setLoading } = useFlightStore();
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let mounted = true;

    async function fetchFlights() {
      try {
        const res = await fetch("/api/flights");
        const data = await res.json();
        if (!mounted) return;
        if (data.error && !data.flights?.length) {
          setError(data.error);
        } else {
          setFlights(data.flights || [], data.source || "");
        }
      } catch {
        if (mounted) setError("Failed to fetch flight data");
      }
    }

    setLoading(true);
    fetchFlights();
    intervalRef.current = setInterval(fetchFlights, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, [setFlights, setError, setLoading]);
}

export function useSchedulePolling() {
  useEffect(() => {
    let mounted = true;

    async function fetchSchedule() {
      try {
        await fetch("/api/schedule");
      } catch {
        // silent - schedule is supplementary
      }
      if (!mounted) return;
    }

    fetchSchedule();
    const id = setInterval(fetchSchedule, SCHEDULE_REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);
}
