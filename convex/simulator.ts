import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

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

function moveBus(currentLat: number, currentLng: number) {
  let closestStop = 0;
  let minDist = Infinity;
  for (let i = 0; i < ROUTE_STOPS.length; i++) {
    const stop = ROUTE_STOPS[i];
    const dist = Math.sqrt(
      Math.pow(currentLat - stop.lat, 2) + Math.pow(currentLng - stop.lng, 2),
    );
    if (dist < minDist) { minDist = dist; closestStop = i; }
  }

  // Loop: wrap back to 0 after the last stop
  const atLastStop =
    closestStop === ROUTE_STOPS.length - 1 && minDist < 0.001;
  const nextStop = atLastStop ? 0 : (closestStop + 1) % ROUTE_STOPS.length;
  const target = ROUTE_STOPS[nextStop];

  const newLat = lerp(currentLat, target.lat, 0.2);
  const newLng = lerp(currentLng, target.lng, 0.2);
  const distMoved = Math.sqrt(
    Math.pow(newLat - currentLat, 2) + Math.pow(newLng - currentLng, 2),
  );

  return {
    lat: newLat,
    lng: newLng,
    speed: Math.min(distMoved * 111000 * 3.6, 60),
  };
}

// ─── Server-side auto ticker ───────────────────────────────────────────────

export const autoTick = internalMutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    if (!state?.running) return; // stopped — don't reschedule

    const buses = await ctx.db.query("buses").collect();
    const now = Date.now();

    for (const bus of buses) {
      if (bus.status === "flagged") continue;
      const { lat, lng, speed } = moveBus(bus.currentLat, bus.currentLng);
      await ctx.db.patch(bus._id, {
        currentLat: lat, currentLng: lng, speed,
        status: "en_route", lastUpdated: now,
      });
      await ctx.db.insert("locationHistory", {
        busId: bus.busId, lat, lng, speed, timestamp: now,
      });
    }

    await ctx.scheduler.runAfter(10000, internal.simulator.autoTick);
  },
});

export const startAutoTick = mutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("simulatorState").first();
    if (state) {
      if (state.running) return; // already running
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

// ─── Manual single tick (kept for per-bus use from the UI) ─────────────────

export const tick = mutation({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    const bus = await ctx.db
      .query("buses").filter((q) => q.eq(q.field("busId"), busId)).first();
    if (!bus || bus.status === "flagged") return;

    const { lat, lng, speed } = moveBus(bus.currentLat, bus.currentLng);
    const now = Date.now();
    await ctx.db.patch(bus._id, {
      currentLat: lat, currentLng: lng, speed,
      status: "en_route", lastUpdated: now,
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
  args: { busId: v.string(), stopIndex: v.optional(v.number()) },
  handler: async (ctx, { busId, stopIndex = 0 }) => {
    const bus = await ctx.db
      .query("buses").filter((q) => q.eq(q.field("busId"), busId)).first();
    if (!bus) throw new Error("Bus not found");
    const stop = ROUTE_STOPS[Math.min(stopIndex, ROUTE_STOPS.length - 1)];
    await ctx.db.patch(bus._id, {
      currentLat: stop.lat, currentLng: stop.lng,
      speed: 0, status: "idle", lastUpdated: Date.now(),
    });
  },
});
