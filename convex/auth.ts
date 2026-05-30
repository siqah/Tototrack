import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const betterAuthClient = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    database: betterAuthClient.adapter(ctx),
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "parent" },
        schoolId: { type: "string", required: false },
        busId: { type: "string", required: false },
      },
    },
  });

export async function requireRole(ctx: QueryCtx | MutationCtx, role: string) {
  const user = await betterAuthClient.safeGetAuthUser(ctx);
  if (!user || (user as Record<string, unknown>).role !== role) {
    throw new Error(`Unauthorized: requires ${role}`);
  }
  return user;
}
