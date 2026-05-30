"use client";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ParentPage() {
  const { data: session, isPending } = useSession();
  const children = useQuery(
    api.children.getByParent,
    session ? { parentUserId: session.user.id } : "skip",
  );

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🏠 My Children</h1>
        <p className="text-gray-500 text-sm">Live transit status</p>
      </header>

      {!children || children.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">
          No children registered. Contact your school admin.
        </p>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {children.map((child) => (
            <div key={child._id} className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{child.name}</h2>
                  <p className="text-sm text-gray-500">
                    {child.grade} · Bus {child.busId}
                  </p>
                  <p className="text-sm text-gray-500">Stop: {child.stopLabel}</p>
                </div>
                <Badge
                  variant={
                    child.status === "onboard" ? "default" :
                    child.status === "delivered" ? "secondary" : "outline"
                  }
                >
                  {child.status}
                </Badge>
              </div>
              {child.boardedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  Boarded at {new Date(child.boardedAt).toLocaleTimeString("en-KE")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
