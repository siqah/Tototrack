"use client";
import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

const DEMO_BUSES = ["KCA-123Y", "KBZ-456X"];

export default function SetupPage() {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState("");

  const seedDemo = useAction(api.seed.seedDemo);
  const startAutoTick = useMutation(api.simulator.startAutoTick);
  const stopAutoTick = useMutation(api.simulator.stopAutoTick);
  const triggerAnomaly = useMutation(api.simulator.triggerAnomaly);
  const resetBus = useMutation(api.simulator.resetBus);
  const simRunning = useQuery(api.simulator.isRunning);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/sign-in");

  async function handleSeed() {
    setStatus("Seeding demo data — creating auth users and school...");
    try {
      const result = await seedDemo({
        adminUserId: session!.user.id,
        adminEmail: session!.user.email,
      });
      setStatus(`✅ Done! School ID: ${result.schoolId}. Head to the dashboard to see buses on the map.`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white">← Dashboard</a>
          <h1 className="text-2xl font-bold">Demo Setup</h1>
        </div>

        {/* Seed section */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
          <h2 className="font-semibold">Demo Data</h2>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>👩 <strong>grace.wekesa@demo.tototrack</strong> / password → parent of Amani</li>
            <li>👨 <strong>james.otieno@demo.tototrack</strong> / password → parent of Zawadi</li>
            <li>👩 <strong>mary.mwangi@demo.tototrack</strong> / password → parent of Baraka</li>
            <li>👨 <strong>peter.kamau@demo.tototrack</strong> / password → parent of Imani</li>
            <li>🚌 <strong>driver.kca@demo.tototrack</strong> / password → driver KCA-123Y</li>
            <li>🚌 <strong>driver.kbz@demo.tototrack</strong> / password → driver KBZ-456X</li>
          </ul>
          <Button onClick={handleSeed} className="w-full" variant="outline">
            Seed Demo Data
          </Button>
        </div>

        {/* Simulator — always visible once session exists */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Simulator</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              simRunning ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"
            }`}>
              {simRunning ? "● Running" : "● Stopped"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Server-side scheduler — keeps running even if you close this page.
            Buses loop Westlands → Karen → Westlands every 10 seconds.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => startAutoTick()}
              disabled={!!simRunning}
              size="sm"
              className="bg-green-700 hover:bg-green-600"
            >
              Start
            </Button>
            <Button
              onClick={() => stopAutoTick()}
              disabled={!simRunning}
              variant="outline"
              size="sm"
            >
              Stop
            </Button>
          </div>
        </div>

        {/* Bus controls */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
          <h2 className="font-semibold">Bus Controls</h2>
          {DEMO_BUSES.map((busId) => (
            <div key={busId} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-24">{busId}</span>
              <Button
                onClick={async () => {
                  await triggerAnomaly({ busId });
                  setStatus(`⚠️ Anomaly triggered on ${busId}`);
                }}
                variant="destructive"
                size="sm"
              >
                Trigger Anomaly
              </Button>
              <Button
                onClick={async () => {
                  await resetBus({ busId });
                  setStatus(`✅ Bus ${busId} reset to start`);
                }}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
            </div>
          ))}
        </div>

        {status && (
          <p className="text-sm text-gray-300 bg-gray-900 rounded p-3 leading-relaxed">{status}</p>
        )}
      </div>
    </div>
  );
}
