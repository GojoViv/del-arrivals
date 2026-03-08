"use client";

import { create } from "zustand";
import { Flight, FilterType, Stats } from "@/lib/types";

interface FlightStore {
  flights: Flight[];
  filter: FilterType;
  selectedIcao: string | null;
  lastUpdate: Date | null;
  source: string;
  error: string | null;
  loading: boolean;

  setFlights: (flights: Flight[], source: string) => void;
  setFilter: (filter: FilterType) => void;
  selectFlight: (icao: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  flights: [],
  filter: "all",
  selectedIcao: null,
  lastUpdate: null,
  source: "",
  error: null,
  loading: true,

  setFlights: (flights, source) =>
    set({ flights, source, lastUpdate: new Date(), error: null, loading: false }),
  setFilter: (filter) => set({ filter }),
  selectFlight: (icao) => set({ selectedIcao: icao }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

export function useFilteredFlights(): Flight[] {
  const flights = useFlightStore((s) => s.flights);
  const filter = useFlightStore((s) => s.filter);

  switch (filter) {
    case "international":
      return flights.filter((f) => f.isInternational);
    case "domestic":
      return flights.filter((f) => !f.isInternational);
    case "on_time":
      return flights.filter((f) => f.delayStatus === "on_time");
    case "delayed":
      return flights.filter((f) => f.delayStatus === "delayed");
    default:
      return flights;
  }
}

export function useStats(): Stats {
  const flights = useFlightStore((s) => s.flights);
  const onTime = flights.filter((f) => f.delayStatus === "on_time").length;
  const delayed = flights.filter((f) => f.delayStatus === "delayed").length;
  const etas = flights.map((f) => f.etaMinutes).filter((e) => e < Infinity);

  return {
    total: flights.length,
    international: flights.filter((f) => f.isInternational).length,
    domestic: flights.filter((f) => !f.isInternational).length,
    onTime,
    delayed,
    nextEta: etas.length ? Math.min(...etas) : null,
  };
}
