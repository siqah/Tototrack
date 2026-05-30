import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const log = mutation({
  args: {
    to: v.string(),
    message: v.string(),
    type: v.string(),
    childId: v.optional(v.id("children")),
    alertId: v.optional(v.id("alerts")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("smsLog", {
      ...args,
      status: "pending",
      sentAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { logId: v.id("smsLog"), status: v.string() },
  handler: async (ctx, { logId, status }) => {
    await ctx.db.patch(logId, { status });
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    return ctx.db.query("smsLog").order("desc").take(limit);
  },
});
