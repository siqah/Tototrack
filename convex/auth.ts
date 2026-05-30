import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const betterAuthClient = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    database: betterAuthClient.adapter(ctx),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    trustedOrigins: [
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
    ],
    emailAndPassword: { enabled: true },
    ...(googleClientId && googleClientSecret
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          },
        }
      : {}),
  });
};

// Roles are stored in convex/userRoles.ts — not in better-auth user fields
export async function requireRole(ctx: QueryCtx | MutationCtx, role: string) {
  const user = await betterAuthClient.safeGetAuthUser(ctx);
  if (!user) throw new Error("Unauthorized: not signed in");

  const roleDoc = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q) => q.eq("userId", String(user._id)))
    .first();

  const userRole = roleDoc?.role ?? "parent";
  if (userRole !== role) throw new Error(`Unauthorized: requires ${role}`);
  return { ...user, role: userRole };
}
