import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    busId: v.string(),
    schoolId: v.id("schools"),
    waypoints: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
        label: v.string(),
        order: v.number(),
        expectedArrivalTime: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("routes", args);
  },
});

export const getByBus = query({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    return ctx.db
      .query("routes")
      .withIndex("by_bus", (q) => q.eq("busId", busId))
      .first();
  },
});
