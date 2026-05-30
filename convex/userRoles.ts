import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setRole = mutation({
  args: {
    userId: v.string(),
    role: v.string(),
    schoolId: v.optional(v.string()),
    busId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        schoolId: args.schoolId,
        busId: args.busId,
      });
    } else {
      await ctx.db.insert("userRoles", args);
    }
  },
});

export const getRole = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const doc = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return doc?.role ?? "parent";
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});
