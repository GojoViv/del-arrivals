"use client";

import {
  useFlightStore,
  useFilteredFlights,
} from "@/hooks/use-flight-store";
import { FilterType, Flight } from "@/lib/types";

const TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "international", label: "Intl" },
  { key: "domestic", label: "Dom" },
  { key: "on_time", label: "On Time" },
  { key: "delayed", label: "Delayed" },
];

export function FlightList() {
  const filter = useFlightStore((s) => s.filter);
  const setFilter = useFlightStore((s) => s.setFilter);
  const flights = useFilteredFlights();
  const loading = useFlightStore((s) => s.loading);

  return (
    <div className="flex h-full flex-col">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/10 px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === t.key
                ? "bg-white/15 text-white"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Flight rows */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-white/30">Loading flights...</div>
        ) : flights.length === 0 ? (
          <div className="p-8 text-center text-white/30">No flights found</div>
        ) : (
          flights.map((f) => <FlightRow key={f.icao24 || f.callsign} flight={f} />)
        )}
      </div>
    </div>
  );
}

function FlightRow({ flight }: { flight: Flight }) {
  const selectedIcao = useFlightStore((s) => s.selectedIcao);
  const selectFlight = useFlightStore((s) => s.selectFlight);
  const isSelected = selectedIcao === flight.icao24;

  function formatEta(mins: number) {
    if (mins >= 9999) return "--";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  }

  const etaColor =
    flight.etaMinutes < 30
      ? "text-red-400"
      : flight.etaMinutes < 120
        ? "text-yellow-400"
        : "text-green-400";

  const statusBadge =
    flight.delayStatus === "on_time" ? (
      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] text-green-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
        On Time
      </span>
    ) : flight.delayStatus === "delayed" ? (
      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
        +{flight.delayMinutes}m
      </span>
    ) : null;

  const vRateIcon =
    flight.vertRate < -1
      ? "↓"
      : flight.vertRate > 1
        ? "↑"
        : "→";

  return (
    <button
      onClick={() => selectFlight(isSelected ? null : flight.icao24)}
      className={`flex w-full items-center gap-3 border-b border-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${
        isSelected ? "bg-white/10" : ""
      }`}
    >
      {/* Airline + Flight */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-medium text-white">
            {flight.flightIata || flight.callsign}
          </span>
          <span className="text-[10px] text-white/30">
            {flight.isInternational ? "🌐" : "🇮🇳"}
          </span>
          {statusBadge}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-white/40">
          {flight.airline}
          {flight.country ? ` · ${flight.country}` : ""}
        </div>
      </div>

      {/* Alt + Speed */}
      <div className="hidden text-right text-[11px] text-white/40 sm:block">
        <div>{flight.altFt.toLocaleString()} ft</div>
        <div>
          {flight.speedKts} kts {vRateIcon}
        </div>
      </div>

      {/* Distance + ETA */}
      <div className="text-right">
        <div className="text-xs text-white/50">{flight.distKm} km</div>
        <div className={`text-sm font-bold tabular-nums ${etaColor}`}>
          {formatEta(flight.etaMinutes)}
        </div>
      </div>
    </button>
  );
}
