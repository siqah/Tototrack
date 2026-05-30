"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function FleetOverview({ schoolId }: { schoolId: string }) {
  const buses = useQuery(
    api.buses.getLiveBySchool,
    schoolId ? { schoolId } : "skip",
  );
  const alerts = useQuery(
    api.alerts.getActiveBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip",
  );

  const busCount = buses?.length ?? 0;
  const alertCount = alerts?.length ?? 0;
  const childrenInTransit = busCount * 2; // placeholder until children query is wired

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
        Fleet Overview
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Buses" value={busCount} color="text-blue-400" />
        <StatCard label="Alerts" value={alertCount} color={alertCount > 0 ? "text-red-400" : "text-green-400"} />
        <StatCard label="In Transit" value={childrenInTransit} color="text-yellow-400" />
      </div>

      {buses && buses.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Active Buses</h3>
          {buses.map((bus) => (
            <a
              key={bus._id}
              href={`/buses/${bus.busId}`}
              className="flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 hover:bg-gray-700 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{bus.busId}</p>
                <p className="text-xs text-gray-400">{bus.driverName}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  bus.status === "flagged"
                    ? "bg-red-900 text-red-300"
                    : bus.status === "en_route"
                      ? "bg-green-900 text-green-300"
                      : "bg-yellow-900 text-yellow-300"
                }`}
              >
                {bus.speed.toFixed(0)} km/h
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-gray-800 p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
