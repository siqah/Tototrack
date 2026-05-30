"use client";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { redirect } from "next/navigation";

export default function AlertsPage() {
  const { data: session, isPending } = useSession();
  const userRole = useQuery(
    api.userRoles.getByUser,
    session ? { userId: session.user.id } : "skip",
  );

  if (isPending) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Loading...</div>;
  if (!session) redirect("/sign-in");

  const schoolId = userRole?.schoolId ?? "";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/" className="text-gray-400 hover:text-white">← Dashboard</a>
          <h1 className="text-2xl font-bold">All Alerts</h1>
        </div>
        <AlertFeed schoolId={schoolId} showAll />
      </div>
    </div>
  );
}
