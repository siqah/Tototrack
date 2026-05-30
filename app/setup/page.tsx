"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function SetupPage() {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [buses, setBuses] = useState<Array<{ busId: string }>>([]);
  const [simRunning, setSimRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const seedDemo = useAction(api.seed.seedDemo);
  const tick = useMutation(api.simulator.tick);
  const triggerAnomaly = useMutation(api.simulator.triggerAnomaly);
  const resetBus = useMutation(api.simulator.resetBus);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/sign-in");

  async function handleSeed() {
    setStatus("Seeding demo data — creating auth users and school...");
    try {
      const result = await seedDemo({
        adminUserId: session!.user.id,
        adminEmail: session!.user.email,
      });
      setBuses([{ busId: "KCA-123Y" }, { busId: "KBZ-456X" }]);
      setSeeded(true);
      setStatus(`✅ Done! School ID: ${result.schoolId}. Head to the dashboard to see buses on the map.`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
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
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white">← Dashboard</a>
          <h1 className="text-2xl font-bold">Demo Setup</h1>
        </div>

        {!seeded ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              Creates 1 school, 2 buses, 4 children, and <strong>6 real auth accounts</strong>:
            </p>
            <ul className="text-xs text-gray-500 space-y-1 ml-4">
              <li>👩 <strong>grace.wekesa@demo.tototrack</strong> / password → parent of Amani</li>
              <li>👨 <strong>james.otieno@demo.tototrack</strong> / password → parent of Zawadi</li>
              <li>👩 <strong>mary.mwangi@demo.tototrack</strong> / password → parent of Baraka</li>
              <li>👨 <strong>peter.kamau@demo.tototrack</strong> / password → parent of Imani</li>
              <li>🚌 <strong>driver.kca@demo.tototrack</strong> / password → driver KCA-123Y</li>
              <li>🚌 <strong>driver.kbz@demo.tototrack</strong> / password → driver KBZ-456X</li>
            </ul>
            <Button onClick={handleSeed} className="w-full">
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
          <p className="text-sm text-gray-300 bg-gray-900 rounded p-3 leading-relaxed">{status}</p>
        )}
      </div>
    </div>
  );
}
