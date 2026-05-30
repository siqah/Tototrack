"use client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NAIROBI_CENTER, NAIROBI_ZOOM } from "@/lib/nairobi";
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
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const buses = useQuery(
    api.buses.getLiveBySchool,
    schoolId ? { schoolId } : "skip",
  ) as Bus[] | undefined;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: NAIROBI_CENTER,
      zoom: NAIROBI_ZOOM,
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !buses) return;

    buses.forEach((bus) => {
      const color =
        bus.status === "flagged"
          ? "#ef4444"
          : bus.speed > 5
            ? "#22c55e"
            : "#f59e0b";

      const existing = markers.current.get(bus.busId);
      if (existing) {
        existing.setLngLat([bus.currentLng, bus.currentLat]);
        (existing.getElement() as HTMLDivElement).style.background = color;
      } else {
        const el = document.createElement("div");
        el.style.cssText = `
          width:40px;height:40px;background:${color};
          border:2px solid white;border-radius:50%;
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
