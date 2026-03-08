"use client";

import { useStats, useFlightStore } from "@/hooks/use-flight-store";

export function StatsBar() {
  const stats = useStats();
  const lastUpdate = useFlightStore((s) => s.lastUpdate);
  const source = useFlightStore((s) => s.source);

  const known = stats.onTime + stats.delayed;
  const onTimePct = known > 0 ? Math.round((stats.onTime / known) * 100) : 0;
  const delayPct = known > 0 ? Math.round((stats.delayed / known) * 100) : 0;

  function formatEta(mins: number | null) {
    if (mins === null) return "--";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4 lg:grid-cols-6">
      <Tile label="Inbound" value={stats.total} color="text-cyan-400" />
      <Tile
        label="International"
        value={stats.international}
        color="text-purple-400"
        icon="🌐"
      />
      <Tile
        label="Domestic"
        value={stats.domestic}
        color="text-cyan-300"
        icon="🇮🇳"
      />
      <Tile
        label="On Time"
        value={stats.onTime}
        color="text-green-400"
        icon="✓"
        sub={known > 0 ? `${onTimePct}%` : undefined}
      />
      <Tile
        label="Delayed"
        value={stats.delayed}
        color="text-red-400"
        icon="⚠"
        sub={known > 0 ? `${delayPct}%` : undefined}
      />
      <Tile
        label="Next Arrival"
        value={formatEta(stats.nextEta)}
        color="text-yellow-400"
        icon="⏱"
        sub={
          lastUpdate
            ? `${lastUpdate.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST · ${source}`
            : undefined
        }
      />
    </div>
  );
}

function Tile({
  label,
  value,
  color,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
      <div className="mb-1 text-[11px] uppercase tracking-wider text-white/50">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub && (
        <div className="mt-0.5 text-[10px] text-white/40">{sub}</div>
      )}
    </div>
  );
}
