import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    subscriptionTier: v.string(),
    mpesaPhone: v.string(),
    adminUserId: v.string(),
    adminEmail: v.string(),
    adminPhone: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("schools", {
      ...args,
      subscriptionStatus: "trial",
      createdAt: Date.now(),
    });
  },
});

export const getById = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    return ctx.db.get(schoolId);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("schools").collect();
  },
});
