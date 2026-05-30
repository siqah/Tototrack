"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FleetMap } from "@/components/map/FleetMap";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { BusDetailPanel } from "@/components/dashboard/BusDetailPanel";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function BusDetailPage() {
  const { busId } = useParams<{ busId: string }>();
  const { data: session, isPending } = useSession();
  const bus = useQuery(api.buses.getByBusId, { busId });
  const triggerAnomaly = useMutation(api.simulator.triggerAnomaly);
  const tick = useMutation(api.simulator.tick);

  if (isPending) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Loading...</div>;
  if (!session) redirect("/sign-in");

  const user = session.user as { schoolId?: string };
  const schoolId = user.schoolId ?? "";

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white">← Fleet</a>
          <h1 className="text-xl font-bold">Bus {busId}</h1>
          {bus && (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${
              bus.status === "flagged" ? "bg-red-900 text-red-300" :
              bus.status === "en_route" ? "bg-green-900 text-green-300" :
              "bg-yellow-900 text-yellow-300"
            }`}>
              {bus.status}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => tick({ busId })}
            className="rounded bg-blue-700 px-3 py-1 text-sm hover:bg-blue-600"
          >
            Tick
          </button>
          <button
            onClick={() => triggerAnomaly({ busId })}
            className="rounded bg-red-700 px-3 py-1 text-sm hover:bg-red-600"
          >
            Trigger Anomaly
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <FleetMap schoolId={schoolId} highlightBusId={busId} />
        </div>
        <aside className="w-80 overflow-y-auto border-l border-gray-800 bg-gray-900 p-4 space-y-6">
          {bus && <BusDetailPanel bus={bus} />}
          <AlertFeed schoolId={schoolId} busIdFilter={busId} />
        </aside>
      </div>
    </div>
  );
}
