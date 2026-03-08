"use client";

import { useFlightStore } from "@/hooks/use-flight-store";

export function FlightDetail() {
  const selectedIcao = useFlightStore((s) => s.selectedIcao);
  const flights = useFlightStore((s) => s.flights);
  const selectFlight = useFlightStore((s) => s.selectFlight);

  if (!selectedIcao) return null;
  const f = flights.find((fl) => fl.icao24 === selectedIcao);
  if (!f) return null;

  const statusColor =
    f.delayStatus === "on_time"
      ? "text-green-400"
      : f.delayStatus === "delayed"
        ? "text-red-400"
        : "text-white/50";

  const statusText =
    f.delayStatus === "on_time"
      ? "On Time"
      : f.delayStatus === "delayed"
        ? `Delayed +${f.delayMinutes}m`
        : "Status Unknown";

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-lg border border-white/10 bg-[#0d1117]/95 p-4 shadow-xl backdrop-blur">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-lg font-bold text-white">
            {f.flightIata || f.callsign}
          </div>
          <div className="text-sm text-white/50">{f.airline}</div>
        </div>
        <button
          onClick={() => selectFlight(null)}
          className="text-white/30 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <Row label="Status" value={statusText} valueClass={statusColor} />
        {f.scheduledArrival && (
          <Row label="Scheduled" value={f.scheduledArrival} />
        )}
        <Row label="Country" value={f.country || "Unknown"} />
        <Row label="Altitude" value={`${f.altFt.toLocaleString()} ft`} />
        <Row label="Speed" value={`${f.speedKts} kts`} />
        <Row label="Heading" value={`${Math.round(f.heading)}°`} />
        <Row
          label="Vertical"
          value={`${f.vertRate > 0 ? "+" : ""}${Math.round(f.vertRate)} ft/m`}
        />
        <Row label="Distance" value={`${f.distKm} km`} />
        <Row label="ETA" value={formatEta(f.etaMinutes)} />
        <Row
          label="Position"
          value={`${f.lat.toFixed(3)}, ${f.lon.toFixed(3)}`}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-white/80",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function formatEta(mins: number) {
  if (mins >= 9999) return "--";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
