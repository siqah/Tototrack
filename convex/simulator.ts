import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ROUTE_STOPS = [
  { label: "Westlands", lng: 36.8104, lat: -1.2636 },
  { label: "Sarit Centre", lng: 36.8067, lat: -1.2587 },
  { label: "ABC Place Junction", lng: 36.798, lat: -1.2631 },
  { label: "Ngong Road Junction", lng: 36.7927, lat: -1.2897 },
  { label: "Karen", lng: 36.7117, lat: -1.3191 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const tick = mutation({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    const bus = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
    if (!bus || bus.status === "flagged") return;

    // Find current position along the route
    let closestStop = 0;
    let minDist = Infinity;
    for (let i = 0; i < ROUTE_STOPS.length; i++) {
      const stop = ROUTE_STOPS[i];
      const dist = Math.sqrt(
        Math.pow(bus.currentLat - stop.lat, 2) +
          Math.pow(bus.currentLng - stop.lng, 2),
      );
      if (dist < minDist) {
        minDist = dist;
        closestStop = i;
      }
    }

    const nextStop = Math.min(closestStop + 1, ROUTE_STOPS.length - 1);
    const target = ROUTE_STOPS[nextStop];

    // Move 20% toward the next stop
    const newLat = lerp(bus.currentLat, target.lat, 0.2);
    const newLng = lerp(bus.currentLng, target.lng, 0.2);

    const distMoved = Math.sqrt(
      Math.pow(newLat - bus.currentLat, 2) +
        Math.pow(newLng - bus.currentLng, 2),
    );
    const speed = distMoved * 111000 * 3.6; // rough km/h

    const now = Date.now();
    await ctx.db.patch(bus._id, {
      currentLat: newLat,
      currentLng: newLng,
      speed: Math.min(speed, 60),
      status: "en_route",
      lastUpdated: now,
    });

    await ctx.db.insert("locationHistory", {
      busId,
      lat: newLat,
      lng: newLng,
      speed: Math.min(speed, 60),
      timestamp: now,
    });
  },
});

export const triggerAnomaly = mutation({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    const bus = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
    if (!bus) throw new Error("Bus not found");

    // Deviate 0.006 degrees (~600m) off route
    await ctx.db.patch(bus._id, {
      currentLat: bus.currentLat + 0.006,
      currentLng: bus.currentLng + 0.006,
      speed: 0,
      status: "flagged",
      lastUpdated: Date.now(),
    });
  },
});

export const resetBus = mutation({
  args: { busId: v.string(), stopIndex: v.optional(v.number()) },
  handler: async (ctx, { busId, stopIndex = 0 }) => {
    const bus = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
    if (!bus) throw new Error("Bus not found");

    const stop = ROUTE_STOPS[Math.min(stopIndex, ROUTE_STOPS.length - 1)];
    await ctx.db.patch(bus._id, {
      currentLat: stop.lat,
      currentLng: stop.lng,
      speed: 0,
      status: "idle",
      lastUpdated: Date.now(),
    });
  },
});
