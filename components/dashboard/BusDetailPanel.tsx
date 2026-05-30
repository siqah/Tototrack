"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Bus {
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
}

export function BusDetailPanel({ bus }: { bus: Bus }) {
  const children = useQuery(api.children.getByBus, { busId: bus.busId });

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Driver</p>
        <p className="text-sm font-medium text-white">{bus.driverName}</p>
        <p className="text-xs text-gray-500">{bus.driverPhone}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-gray-800 p-2">
          <p className="text-gray-400">Speed</p>
          <p className="font-semibold text-white">{bus.speed.toFixed(0)} km/h</p>
        </div>
        <div className="rounded bg-gray-800 p-2">
          <p className="text-gray-400">Status</p>
          <p className="font-semibold text-white capitalize">{bus.status.replace("_", " ")}</p>
        </div>
      </div>

      {children && children.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">
            Children ({children.length})
          </p>
          <div className="space-y-1">
            {children.map((child) => (
              <div
                key={child._id}
                className="flex items-center justify-between rounded bg-gray-800 px-2 py-1.5"
              >
                <div>
                  <p className="text-xs font-medium text-white">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.stopLabel}</p>
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    child.status === "onboard"
                      ? "bg-green-900 text-green-300"
                      : child.status === "delivered"
                        ? "bg-blue-900 text-blue-300"
                        : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {child.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Updated {new Date(bus.lastUpdated).toLocaleTimeString("en-KE")}
      </p>
    </div>
  );
}
