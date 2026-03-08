"use client";

import { StatsBar } from "./stats-bar";
import { FlightList } from "./flight-list";
import { FlightDetail } from "./flight-detail";
import { MapContainer } from "./map-container";
import { useFlightPolling, useSchedulePolling } from "@/hooks/use-polling";
import { useFlightStore } from "@/hooks/use-flight-store";

export function Dashboard() {
  useFlightPolling();
  useSchedulePolling();

  const error = useFlightStore((s) => s.error);
  const loading = useFlightStore((s) => s.loading);

  return (
    <div className="flex h-screen flex-col bg-[#0d1117] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">✈</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              DEL — Indira Gandhi International
            </h1>
            <p className="text-xs text-white/40">
              Live Inbound Flight Tracker · New Delhi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && !error && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              LIVE
            </span>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-center text-sm text-yellow-400">
          ⚠ {error}. Retrying...
        </div>
      )}

      {/* Stats */}
      <StatsBar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - flight list */}
        <div className="w-full border-r border-white/10 lg:w-[440px]">
          <FlightList />
        </div>

        {/* Map */}
        <div className="relative hidden flex-1 lg:block">
          <MapContainer />
          <FlightDetail />
        </div>
      </div>
    </div>
  );
}
