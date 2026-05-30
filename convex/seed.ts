"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const ROUTE_STOPS = [
  { label: "Westlands", lng: 36.8104, lat: -1.2636 },
  { label: "Sarit Centre", lng: 36.8067, lat: -1.2587 },
  { label: "ABC Place Junction", lng: 36.798, lat: -1.2631 },
  { label: "Ngong Road Junction", lng: 36.7927, lat: -1.2897 },
  { label: "Karen", lng: 36.7117, lat: -1.3191 },
];

const DEMO_PARENTS = [
  { name: "Grace Wekesa", email: "grace.wekesa@demo.tototrack", phone: "254712000001" },
  { name: "James Otieno", email: "james.otieno@demo.tototrack", phone: "254712000002" },
  { name: "Mary Mwangi", email: "mary.mwangi@demo.tototrack", phone: "254712000003" },
  { name: "Peter Kamau", email: "peter.kamau@demo.tototrack", phone: "254712000004" },
];

const DEMO_DRIVERS = [
  { name: "James Mwangi", email: "driver.kca@demo.tototrack", phone: "254712000010" },
  { name: "Peter Kamau", email: "driver.kbz@demo.tototrack", phone: "254712000011" },
];

const DEMO_BUSES = [
  { busId: "KCA-123Y", plateNumber: "KCA 123Y", driverIndex: 0, stopIndex: 0 },
  { busId: "KBZ-456X", plateNumber: "KBZ 456X", driverIndex: 1, stopIndex: 2 },
];

const DEMO_CHILDREN = [
  { name: "Amani Wekesa", parentIndex: 0, grade: "Grade 4", stopLabel: "Westlands", stopOrder: 0, busIndex: 0 },
  { name: "Zawadi Otieno", parentIndex: 1, grade: "Grade 3", stopLabel: "Sarit Centre", stopOrder: 1, busIndex: 0 },
  { name: "Baraka Mwangi", parentIndex: 2, grade: "Grade 5", stopLabel: "Karen", stopOrder: 4, busIndex: 1 },
  { name: "Imani Kamau", parentIndex: 3, grade: "Grade 2", stopLabel: "Ngong Road Junction", stopOrder: 3, busIndex: 1 },
];

async function signUpOrSignIn(
  baseUrl: string,
  email: string,
  name: string,
): Promise<string | null> {
  // Try sign-up first
  const signUpRes = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password", name }),
  });

  if (signUpRes.ok) {
    const data = await signUpRes.json() as { user?: { id?: string } };
    return data.user?.id ?? null;
  }

  // User already exists — sign in to retrieve their ID
  const signInRes = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password" }),
  });

  if (!signInRes.ok) return null;
  const data = await signInRes.json() as { user?: { id?: string } };
  return data.user?.id ?? null;
}

export const seedDemo = action({
  args: {
    adminUserId: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx, { adminUserId, adminEmail }): Promise<{ schoolId: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

    // 1. Create parent auth users
    const parentIds: string[] = [];
    for (const parent of DEMO_PARENTS) {
      const userId = await signUpOrSignIn(baseUrl, parent.email, parent.name);
      parentIds.push(userId ?? "");
      if (userId) {
        await ctx.runMutation(api.userRoles.setRole, { userId, role: "parent" });
      }
    }

    // 2. Create driver auth users
    const driverIds: string[] = [];
    for (const driver of DEMO_DRIVERS) {
      const userId = await signUpOrSignIn(baseUrl, driver.email, driver.name);
      driverIds.push(userId ?? "");
      if (userId) {
        await ctx.runMutation(api.userRoles.setRole, { userId, role: "driver" });
      }
    }

    // 3. Create school
    const schoolId = await ctx.runMutation(api.schools.create, {
      name: "Westlands Academy",
      subscriptionTier: "growth",
      mpesaPhone: "254712000000",
      adminUserId,
      adminEmail,
      adminPhone: "254712000000",
    });

    // 4. Link admin to school
    await ctx.runMutation(api.userRoles.setRole, {
      userId: adminUserId,
      role: "school_admin",
      schoolId: String(schoolId),
    });

    // 5. Create buses, routes, and link drivers to school+bus
    const waypoints = ROUTE_STOPS.map((s, idx) => ({
      lat: s.lat,
      lng: s.lng,
      label: s.label,
      order: idx,
      expectedArrivalTime: `0${7 + idx}:${String(idx * 10).padStart(2, "0")}`,
    }));

    for (let i = 0; i < DEMO_BUSES.length; i++) {
      const b = DEMO_BUSES[i];
      const driver = DEMO_DRIVERS[b.driverIndex];
      const driverUserId = driverIds[b.driverIndex];
      const startStop = ROUTE_STOPS[b.stopIndex];

      await ctx.runMutation(api.buses.create, {
        schoolId: schoolId as Id<"schools">,
        busId: b.busId,
        plateNumber: b.plateNumber,
        driverName: driver.name,
        driverPhone: driver.phone,
        initialLat: startStop.lat,
        initialLng: startStop.lng,
      });

      await ctx.runMutation(api.routes.create, {
        busId: b.busId,
        schoolId: schoolId as Id<"schools">,
        waypoints,
      });

      if (driverUserId) {
        await ctx.runMutation(api.userRoles.setRole, {
          userId: driverUserId,
          role: "driver",
          schoolId: String(schoolId),
          busId: b.busId,
        });
      }
    }

    // 6. Create children with real parentUserId
    for (const child of DEMO_CHILDREN) {
      const b = DEMO_BUSES[child.busIndex];
      const parent = DEMO_PARENTS[child.parentIndex];
      const parentUserId = parentIds[child.parentIndex] || undefined;

      await ctx.runMutation(api.children.create, {
        schoolId: schoolId as Id<"schools">,
        busId: b.busId,
        name: child.name,
        parentName: parent.name,
        parentPhone: parent.phone,
        parentUserId,
        stopLabel: child.stopLabel,
        stopOrder: child.stopOrder,
        grade: child.grade,
      });
    }

    return { schoolId: String(schoolId) };
  },
});
