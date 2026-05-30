import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getLiveBySchool = query({
  args: { schoolId: v.string() },
  handler: async (ctx, { schoolId }) => {
    return ctx.db
      .query("buses")
      .withIndex("by_school", (q) =>
        q.eq("schoolId", schoolId as Id<"schools">),
      )
      .collect();
  },
});

export const getByBusId = query({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    return ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
  },
});

export const create = mutation({
  args: {
    schoolId: v.id("schools"),
    busId: v.string(),
    plateNumber: v.string(),
    driverName: v.string(),
    driverPhone: v.string(),
    initialLat: v.number(),
    initialLng: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("buses", {
      schoolId: args.schoolId,
      busId: args.busId,
      plateNumber: args.plateNumber,
      driverName: args.driverName,
      driverPhone: args.driverPhone,
      currentLat: args.initialLat,
      currentLng: args.initialLng,
      speed: 0,
      status: "idle",
      lastUpdated: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { busId: v.string(), status: v.string() },
  handler: async (ctx, { busId, status }) => {
    const bus = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("busId"), busId))
      .first();
    if (!bus) throw new Error("Bus not found");
    await ctx.db.patch(bus._id, { status });
  },
});
