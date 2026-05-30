"use client";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { BoardingList } from "@/components/driver/BoardingList";
import { redirect } from "next/navigation";

export default function DriverPage() {
  const { busId } = useParams<{ busId: string }>();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-2xl">🚌</span>
        <div>
          <h1 className="font-bold text-gray-900">TotoTrack Driver</h1>
          <p className="text-xs text-gray-500">Bus {busId}</p>
        </div>
      </header>
      <main className="max-w-md mx-auto p-4">
        <BoardingList busId={busId} driverUserId={session.user.id} />
      </main>
    </div>
  );
}
