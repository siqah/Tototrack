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
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "parent" },
        schoolId: { type: "string", required: false },
        busId: { type: "string", required: false },
      },
    },
  });
};

export async function requireRole(ctx: QueryCtx | MutationCtx, role: string) {
  const user = await betterAuthClient.safeGetAuthUser(ctx);
  if (!user || (user as Record<string, unknown>).role !== role) {
    throw new Error(`Unauthorized: requires ${role}`);
  }
  return user;
}
