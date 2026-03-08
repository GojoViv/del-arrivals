"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFlightStore, useFilteredFlights } from "@/hooks/use-flight-store";
import { DEL_LAT, DEL_LON, MAX_DISTANCE_KM } from "@/lib/constants";

export function FlightMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const flights = useFilteredFlights();
  const selectFlight = useFlightStore((s) => s.selectFlight);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [DEL_LAT, DEL_LON],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18 }
    ).addTo(map);

    // DEL airport marker
    L.circleMarker([DEL_LAT, DEL_LON], {
      radius: 8,
      color: "#56ccf2",
      fillColor: "#56ccf2",
      fillOpacity: 0.8,
      weight: 2,
    })
      .addTo(map)
      .bindTooltip("DEL", {
        permanent: true,
        className: "del-tooltip",
        direction: "top",
      });

    // Coverage circle
    L.circle([DEL_LAT, DEL_LON], {
      radius: MAX_DISTANCE_KM * 1000,
      color: "#56ccf2",
      fillColor: "#56ccf2",
      fillOpacity: 0.02,
      weight: 1,
      dashArray: "8 4",
      opacity: 0.2,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    for (const f of flights) {
      const color = f.isInternational ? "#a371f7" : "#56ccf2";
      const statusRing =
        f.delayStatus === "delayed"
          ? "#f85149"
          : f.delayStatus === "on_time"
            ? "#3fb950"
            : "transparent";

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          font-size: 18px;
          transform: rotate(${f.heading}deg);
          filter: drop-shadow(0 0 4px ${color});
          line-height: 1;
          text-align: center;
          border: 2px solid ${statusRing};
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">✈</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([f.lat, f.lon], { icon }).addTo(
        markersRef.current!
      );

      marker.bindTooltip(
        `<div style="font-family:monospace;font-size:11px;">
          <b>${f.flightIata || f.callsign}</b><br/>
          ${f.airline}<br/>
          ${f.altFt.toLocaleString()} ft · ${f.distKm} km<br/>
          ${f.delayStatus === "on_time" ? '<span style="color:#3fb950">On Time</span>' : f.delayStatus === "delayed" ? `<span style="color:#f85149">Delayed +${f.delayMinutes}m</span>` : ""}
        </div>`,
        { className: "flight-tooltip" }
      );

      marker.on("click", () => selectFlight(f.icao24));

      // Dashed line to DEL
      L.polyline([[f.lat, f.lon], [DEL_LAT, DEL_LON]], {
        color,
        weight: 1,
        opacity: 0.2,
        dashArray: "4 6",
      }).addTo(markersRef.current!);
    }
  }, [flights, selectFlight]);

  return <div ref={containerRef} className="h-full w-full" />;
}
