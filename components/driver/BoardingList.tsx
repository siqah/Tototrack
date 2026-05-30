"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BoardingListProps {
  busId: string;
  driverUserId: string;
}

export function BoardingList({ busId, driverUserId }: BoardingListProps) {
  const children = useQuery(api.children.getByBus, { busId });
  const bus = useQuery(api.buses.getByBusId, { busId });
  const confirmBoarding = useMutation(api.children.confirmBoarding);
  const sendSMS = useAction(api.notifications.sendParentSMS);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleConfirm(childId: Id<"children">, childName: string, parentPhone: string) {
    setLoading(childId);
    try {
      const child = await confirmBoarding({ childId, confirmedBy: driverUserId });
      if (child && bus) {
        await sendSMS({
          childName,
          parentPhone,
          childId,
          event: "boarding",
          locationDescription: "near the pick-up stop",
          etaMinutes: 15,
          plateNumber: bus.plateNumber,
          type: "boarding",
        });
      }
    } finally {
      setLoading(null);
    }
  }

  if (!children) {
    return <p className="text-center text-gray-500 py-8">Loading children...</p>;
  }

  const waiting = children.filter((c) => c.status === "waiting");
  const onboard = children.filter((c) => c.status === "onboard");

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-3 flex justify-between text-sm">
        <span className="text-blue-700 font-medium">
          {onboard.length} / {children.length} boarded
        </span>
        <span className="text-blue-600">{waiting.length} waiting</span>
      </div>

      {waiting.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Waiting
          </h2>
          <div className="space-y-2">
            {waiting.map((child) => (
              <div
                key={child._id}
                className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-500">{child.grade} · {child.stopLabel}</p>
                </div>
                <Button
                  onClick={() => handleConfirm(child._id, child.name, child.parentPhone)}
                  disabled={loading === child._id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-500"
                >
                  {loading === child._id ? "..." : "Confirm Boarded"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {onboard.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            On Board ✓
          </h2>
          <div className="space-y-2">
            {onboard.map((child) => (
              <div
                key={child._id}
                className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-500">{child.grade} · {child.stopLabel}</p>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Boarded</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
