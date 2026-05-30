import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ROAD_COORDS } from "./roadCoords";

// Approximate speed: each tick advances one road point (~85m at 10s = ~30 km/h)
const TICK_MS = 10000;

function distKmh(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
) {
  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;
  const meters = Math.sqrt(dlat * dlat + dlng * dlng) * 111000;
  return (meters / (TICK_MS / 1000)) * 3.6;
}

// ─── Server-side auto ticker ───────────────────────────────────────────────

export const autoTick = internalMutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    if (!state?.running) return;

    const buses = await ctx.db.query("buses").collect();
    const now = Date.now();

    for (const bus of buses) {
      if (bus.status === "flagged") continue;

      const currentIdx = bus.routePointIndex ?? 0;
      const nextIdx = (currentIdx + 1) % ROAD_COORDS.length;
      const [lat, lng] = ROAD_COORDS[nextIdx];
      const [prevLat, prevLng] = ROAD_COORDS[currentIdx];
      const speed = distKmh(prevLat, prevLng, lat, lng);

      await ctx.db.patch(bus._id, {
        currentLat: lat,
        currentLng: lng,
        speed,
        status: "en_route",
        lastUpdated: now,
        routePointIndex: nextIdx,
      });

      await ctx.db.insert("locationHistory", {
        busId: bus.busId,
        lat,
        lng,
        speed,
        timestamp: now,
      });
    }

    await ctx.scheduler.runAfter(TICK_MS, internal.simulator.autoTick);
  },
});

export const startAutoTick = mutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    if (state) {
      if (state.running) return;
      await ctx.db.patch(state._id, { running: true });
    } else {
      await ctx.db.insert("simulatorState", { running: true });
    }
    await ctx.scheduler.runAfter(0, internal.simulator.autoTick);
  },
});

export const stopAutoTick = mutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    if (state) await ctx.db.patch(state._id, { running: false });
  },
});

export const isRunning = query({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    return state?.running ?? false;
  },
});

// ─── Manual single tick ────────────────────────────────────────────────────

export const tick = mutation({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    const bus = await ctx.db
      .query("buses").filter((q) => q.eq(q.field("busId"), busId)).first();
    if (!bus || bus.status === "flagged") return;

    const currentIdx = bus.routePointIndex ?? 0;
    const nextIdx = (currentIdx + 1) % ROAD_COORDS.length;
    const [lat, lng] = ROAD_COORDS[nextIdx];
    const [prevLat, prevLng] = ROAD_COORDS[currentIdx];
    const speed = distKmh(prevLat, prevLng, lat, lng);
    const now = Date.now();

    await ctx.db.patch(bus._id, {
      currentLat: lat, currentLng: lng, speed,
      status: "en_route", lastUpdated: now,
      routePointIndex: nextIdx,
    });
    await ctx.db.insert("locationHistory", {
      busId, lat, lng, speed, timestamp: now,
    });
  },
});

// ─── Anomaly + reset ───────────────────────────────────────────────────────

export const triggerAnomaly = mutation({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    const bus = await ctx.db
      .query("buses").filter((q) => q.eq(q.field("busId"), busId)).first();
    if (!bus) throw new Error("Bus not found");
    await ctx.db.patch(bus._id, {
      currentLat: bus.currentLat + 0.006,
      currentLng: bus.currentLng + 0.006,
      speed: 0, status: "flagged", lastUpdated: Date.now(),
    });
  },
});

export const resetBus = mutation({
  args: { busId: v.string(), pointIndex: v.optional(v.number()) },
  handler: async (ctx, { busId, pointIndex = 0 }) => {
    const bus = await ctx.db
      .query("buses").filter((q) => q.eq(q.field("busId"), busId)).first();
    if (!bus) throw new Error("Bus not found");
    const idx = Math.min(pointIndex, ROAD_COORDS.length - 1);
    const [lat, lng] = ROAD_COORDS[idx];
    await ctx.db.patch(bus._id, {
      currentLat: lat, currentLng: lng,
      speed: 0, status: "idle",
      lastUpdated: Date.now(), routePointIndex: idx,
    });
  },
});
