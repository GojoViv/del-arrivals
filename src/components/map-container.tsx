"use client";

import dynamic from "next/dynamic";

const FlightMap = dynamic(() => import("./map").then((m) => m.FlightMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white/30">
      Loading map...
    </div>
  ),
});

export function MapContainer() {
  return <FlightMap />;
}
