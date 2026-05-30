"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface AlertFeedProps {
  schoolId: string;
  busIdFilter?: string;
  showAll?: boolean;
}

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-900 text-red-300",
  medium: "bg-orange-900 text-orange-300",
  low: "bg-yellow-900 text-yellow-300",
};

const TYPE_LABELS: Record<string, string> = {
  off_route: "Off Route",
  unexpected_stop: "Stopped",
  speeding: "Speeding",
  no_movement: "No Movement",
};

export function AlertFeed({ schoolId, busIdFilter, showAll }: AlertFeedProps) {
  const allAlerts = useQuery(
    api.alerts.getBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip",
  );
  const resolve = useMutation(api.alerts.resolve);

  const alerts = allAlerts?.filter((a) => {
    if (busIdFilter && a.busId !== busIdFilter) return false;
    if (!showAll && a.resolvedAt) return false;
    return true;
  });

  if (!alerts || alerts.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Alerts
        </h2>
        <p className="text-xs text-gray-500">No active alerts</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
        {showAll ? "All Alerts" : "Active Alerts"} ({alerts.length})
      </h2>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`rounded-lg p-3 space-y-2 ${alert.resolvedAt ? "opacity-50" : "bg-gray-800"}`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${SEVERITY_STYLES[alert.severity] ?? "bg-gray-700 text-gray-300"}`}>
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-xs font-medium text-gray-300">
                {TYPE_LABELS[alert.type] ?? alert.type}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(alert.triggeredAt).toLocaleTimeString("en-KE")}
              </span>
            </div>
            <p className="text-xs text-gray-300">{alert.message}</p>
            <p className="text-xs text-gray-500">Bus: {alert.busId}</p>
            {!alert.resolvedAt && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-gray-600"
                onClick={() => resolve({ alertId: alert._id })}
              >
                Resolve
              </Button>
            )}
            {alert.resolvedAt && (
              <p className="text-xs text-green-500">
                Resolved {new Date(alert.resolvedAt).toLocaleTimeString("en-KE")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
