import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    return ctx.db
      .query("alerts")
      .withIndex("by_school", (q) => q.eq("schoolId", schoolId))
      .order("desc")
      .collect();
  },
});

export const getActiveBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const all = await ctx.db
      .query("alerts")
      .withIndex("by_school", (q) => q.eq("schoolId", schoolId))
      .order("desc")
      .collect();
    return all.filter((a) => !a.resolvedAt);
  },
});

export const create = mutation({
  args: {
    busId: v.string(),
    schoolId: v.id("schools"),
    type: v.string(),
    severity: v.string(),
    message: v.string(),
    parentMessage: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("alerts", {
      ...args,
      triggeredAt: Date.now(),
      notifiedParents: false,
    });
  },
});

export const resolve = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    await ctx.db.patch(alertId, { resolvedAt: Date.now() });

    if (alert) {
      const bus = await ctx.db
        .query("buses")
        .filter((q) => q.eq(q.field("busId"), alert.busId))
        .first();
      if (bus?.status === "flagged") {
        await ctx.db.patch(bus._id, { status: "en_route" });
      }
    }
  },
});

export const markParentsNotified = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, { alertId }) => {
    await ctx.db.patch(alertId, { notifiedParents: true });
  },
});
