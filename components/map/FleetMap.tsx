"use client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NAIROBI_CENTER, NAIROBI_ZOOM, ROAD_ROUTE_COORDS, DEMO_ROUTE_STOPS } from "@/lib/nairobi";
import { BusDetailPanel } from "@/components/dashboard/BusDetailPanel";
import { Id } from "@/convex/_generated/dataModel";

interface FleetMapProps {
  schoolId: string;
  highlightBusId?: string;
}

type Bus = {
  _id: Id<"buses">;
  busId: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  currentLat: number;
  currentLng: number;
  speed: number;
  status: string;
  lastUpdated: number;
  schoolId: Id<"schools">;
};

export function FleetMap({ schoolId, highlightBusId }: FleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const routeDrawn = useRef(false);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const buses = useQuery(
    api.buses.getLiveBySchool,
    schoolId ? { schoolId } : "skip",
  ) as Bus[] | undefined;

  // Init map + draw road path once on load
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: NAIROBI_CENTER,
      zoom: NAIROBI_ZOOM,
    });

    map.on("load", () => {
      if (routeDrawn.current) return;
      routeDrawn.current = true;

      // Faint red road-accurate polyline (same coords the simulator uses)
      map.addSource("road-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: ROAD_ROUTE_COORDS.map(([lat, lng]) => [lng, lat]),
          },
          properties: {},
        },
      });
      map.addLayer({
        id: "road-route-line",
        type: "line",
        source: "road-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#ef4444",
          "line-width": 2.5,
          "line-opacity": 0.4,
          "line-dasharray": [3, 2],
        },
      });

      // Named stop dots with popups
      DEMO_ROUTE_STOPS.forEach((stop) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width:9px;height:9px;background:#ef4444;border-radius:50%;
          border:2px solid rgba(255,255,255,0.8);opacity:0.85;cursor:pointer;
        `;
        new maplibregl.Marker({ element: el })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 12, closeButton: false }).setText(stop.label),
          )
          .addTo(map);
      });
    });

    mapRef.current = map;
  }, []);

  // Move / create bus markers
  useEffect(() => {
    if (!mapRef.current || !buses) return;

    buses.forEach((bus) => {
      const color =
        bus.status === "flagged"
          ? "#ef4444"
          : bus.speed > 5
            ? "#22c55e"
            : "#f59e0b";

      const isHighlighted = highlightBusId === bus.busId;
      const border = isHighlighted ? "3px solid #fff" : "2px solid rgba(255,255,255,0.6)";
      const size = isHighlighted ? "46px" : "40px";

      const existing = markers.current.get(bus.busId);
      if (existing) {
        existing.setLngLat([bus.currentLng, bus.currentLat]);
        const el = existing.getElement() as HTMLDivElement;
        el.style.background = color;
        el.style.border = border;
        el.style.width = size;
        el.style.height = size;
      } else {
        const el = document.createElement("div");
        el.style.cssText = `
          width:${size};height:${size};background:${color};
          border:${border};border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,.4);transition:background .3s;
        `;
        el.textContent = "🚌";
        el.addEventListener("click", () => setSelectedBus(bus));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.currentLng, bus.currentLat])
          .addTo(mapRef.current!);
        markers.current.set(bus.busId, marker);
      }
    });
  }, [buses]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      {selectedBus && (
        <div className="absolute right-4 top-4 w-72 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="font-semibold text-white text-sm">
              Bus {selectedBus.busId}
            </span>
            <button
              onClick={() => setSelectedBus(null)}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-3">
            <BusDetailPanel bus={selectedBus} />
          </div>
          <div className="p-3 border-t border-gray-700">
            <a
              href={`/buses/${selectedBus.busId}`}
              className="text-blue-400 text-sm hover:underline"
            >
              Open full view →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
