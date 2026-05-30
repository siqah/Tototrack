import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByBus = query({
  args: { busId: v.string() },
  handler: async (ctx, { busId }) => {
    return ctx.db
      .query("children")
      .withIndex("by_bus", (q) => q.eq("busId", busId))
      .collect();
  },
});

export const getByParent = query({
  args: { parentUserId: v.string() },
  handler: async (ctx, { parentUserId }) => {
    return ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentUserId", parentUserId))
      .collect();
  },
});

export const create = mutation({
  args: {
    schoolId: v.id("schools"),
    busId: v.string(),
    name: v.string(),
    parentName: v.string(),
    parentPhone: v.string(),
    parentUserId: v.optional(v.string()),
    stopLabel: v.string(),
    stopOrder: v.number(),
    grade: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("children", { ...args, status: "waiting" });
  },
});

export const confirmBoarding = mutation({
  args: { childId: v.id("children"), confirmedBy: v.string() },
  handler: async (ctx, { childId, confirmedBy }) => {
    const child = await ctx.db.get(childId);
    if (!child) throw new Error("Child not found");
    if (child.status === "onboard") throw new Error("Already confirmed");

    const now = Date.now();
    await ctx.db.patch(childId, { status: "onboard", boardedAt: now });

    await ctx.db.insert("boardingEvents", {
      busId: child.busId,
      childId,
      confirmedAt: now,
      confirmedBy,
      method: "manual",
    });

    return child;
  },
});
