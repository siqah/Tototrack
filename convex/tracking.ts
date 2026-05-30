import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateLocation = mutation({
  args: {
    busId: v.string(),
    lat: v.number(),
    lng: v.number(),
    speed: v.number(),
    heading: v.optional(v.number()),
  },
  handler: async (ctx, { busId, lat, lng, speed, heading }) => {
    const bus = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
    if (!bus) throw new Error("Bus not found");

    const now = Date.now();
    await ctx.db.patch(bus._id, {
      currentLat: lat,
      currentLng: lng,
      speed,
      heading,
      lastUpdated: now,
      status: speed > 5 ? "en_route" : "stopped",
    });

    await ctx.db.insert("locationHistory", {
      busId,
      lat,
      lng,
      speed,
      timestamp: now,
    });
  },
});

export const getHistory = query({
  args: { busId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { busId, limit = 20 }) => {
    const history = await ctx.db
      .query("locationHistory")
      .withIndex("by_bus", (q) => q.eq("busId", busId))
      .order("desc")
      .take(limit);
    return history.reverse();
  },
});
