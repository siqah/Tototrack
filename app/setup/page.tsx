"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DEMO_ROUTE_STOPS, DEMO_BUSES } from "@/lib/nairobi";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const DEMO_CHILDREN = [
  { name: "Amani Wekesa", parentName: "Grace Wekesa", parentPhone: "254712345678", stopLabel: "Westlands", stopOrder: 0, grade: "Grade 4", busIndex: 0 },
  { name: "Zawadi Otieno", parentName: "James Otieno", parentPhone: "254723456789", stopLabel: "Sarit Centre", stopOrder: 1, grade: "Grade 3", busIndex: 0 },
  { name: "Baraka Mwangi", parentName: "Mary Mwangi", parentPhone: "254734567890", stopLabel: "Karen", stopOrder: 4, grade: "Grade 5", busIndex: 1 },
  { name: "Imani Kamau", parentName: "Peter Kamau", parentPhone: "254745678901", stopLabel: "Ngong Road Junction", stopOrder: 3, grade: "Grade 2", busIndex: 1 },
];

export default function SetupPage() {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [schoolId, setSchoolId] = useState<Id<"schools"> | null>(null);
  const [buses, setBuses] = useState<Array<{ busId: string; _id: string }>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const createSchool = useMutation(api.schools.create);
  const createBus = useMutation(api.buses.create);
  const createRoute = useMutation(api.routes.create);
  const createChild = useMutation(api.children.create);
  const tick = useMutation(api.simulator.tick);
  const triggerAnomaly = useMutation(api.simulator.triggerAnomaly);
  const resetBus = useMutation(api.simulator.resetBus);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/sign-in");

  const user = session.user as { schoolId?: string };

  async function seedData() {
    setStatus("Creating school...");
    const sid = await createSchool({
      name: "Westlands Academy",
      subscriptionTier: "growth",
      mpesaPhone: "254712345678",
      adminUserId: session!.user.id,
      adminEmail: session!.user.email,
      adminPhone: "254712345678",
    });
    setSchoolId(sid);

    const createdBuses: Array<{ busId: string; _id: string }> = [];
    for (const b of DEMO_BUSES) {
      setStatus(`Creating bus ${b.busId}...`);
      const stop = DEMO_ROUTE_STOPS[b.initialStopIndex];
      const busDocId = await createBus({
        schoolId: sid,
        busId: b.busId,
        plateNumber: b.plateNumber,
        driverName: b.driverName,
        driverPhone: b.driverPhone,
        initialLat: stop.lat,
        initialLng: stop.lng,
      });
      createdBuses.push({ busId: b.busId, _id: busDocId });

      const waypoints = DEMO_ROUTE_STOPS.map((s, i) => ({
        lat: s.lat,
        lng: s.lng,
        label: s.label,
        order: i,
        expectedArrivalTime: `0${7 + i}:${i * 10}`,
      }));
      await createRoute({ busId: b.busId, schoolId: sid, waypoints });
    }
    setBuses(createdBuses);

    for (const child of DEMO_CHILDREN) {
      setStatus(`Adding child ${child.name}...`);
      const busId = DEMO_BUSES[child.busIndex].busId;
      await createChild({
        schoolId: sid,
        busId,
        name: child.name,
        parentName: child.parentName,
        parentPhone: child.parentPhone,
        stopLabel: child.stopLabel,
        stopOrder: child.stopOrder,
        grade: child.grade,
      });
    }

    setStatus("✅ Demo data seeded! Go to the dashboard.");
    setSeeded(true);
  }

  function startSimulator() {
    if (!buses.length) return;
    setSimRunning(true);
    intervalRef.current = setInterval(() => {
      buses.forEach((b) => tick({ busId: b.busId }));
    }, 10000);
  }

  function stopSimulator() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimRunning(false);
  }

  async function handleTriggerAnomaly(busId: string) {
    await triggerAnomaly({ busId });
    setStatus(`⚠️ Anomaly triggered on ${busId}`);
  }

  async function handleReset(busId: string) {
    await resetBus({ busId });
    setStatus(`✅ Bus ${busId} reset to start`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/" className="text-gray-400 hover:text-white">← Dashboard</a>
          <h1 className="text-2xl font-bold">Demo Setup</h1>
        </div>

        {!seeded ? (
          <div className="space-y-4">
            <p className="text-gray-400">
              Seeds 1 school, 2 buses (KCA-123Y, KBZ-456X), 4 children, and demo routes on the Westlands → Karen corridor.
            </p>
            <Button onClick={seedData} className="w-full">
              Seed Demo Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
              <h2 className="font-semibold">Simulator</h2>
              <div className="flex gap-2">
                <Button onClick={startSimulator} disabled={simRunning} size="sm">
                  {simRunning ? "Running..." : "Start (10s interval)"}
                </Button>
                <Button onClick={stopSimulator} disabled={!simRunning} variant="outline" size="sm">
                  Stop
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
              <h2 className="font-semibold">Bus Controls</h2>
              {buses.map((b) => (
                <div key={b.busId} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-24">{b.busId}</span>
                  <Button
                    onClick={() => handleTriggerAnomaly(b.busId)}
                    variant="destructive"
                    size="sm"
                  >
                    Trigger Anomaly
                  </Button>
                  <Button
                    onClick={() => handleReset(b.busId)}
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {status && (
          <p className="mt-4 text-sm text-gray-400 bg-gray-900 rounded p-3">{status}</p>
        )}
      </div>
    </div>
  );
}
