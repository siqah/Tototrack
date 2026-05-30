"use client";
import { useSession } from "@/lib/auth-client";
import { FleetMap } from "@/components/map/FleetMap";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user as { schoolId?: string };
  const schoolId = user.schoolId ?? "";

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <h1 className="text-xl font-bold tracking-tight">🚌 TotoTrack</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{session.user.email}</span>
          <a href="/setup" className="text-blue-400 hover:underline">Setup</a>
          <a href="/alerts" className="text-yellow-400 hover:underline">Alerts</a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <FleetMap schoolId={schoolId} />
        </div>
        <aside className="w-80 overflow-y-auto border-l border-gray-800 bg-gray-900 p-4">
          <FleetOverview schoolId={schoolId} />
          <div className="mt-6">
            <AlertFeed schoolId={schoolId} />
          </div>
        </aside>
      </div>
    </div>
  );
}
