import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import { MutationCtx, QueryCtx } from "./_generated/server";

export const betterAuth = new BetterAuth(components.betterAuth);

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: string,
) {
  const session = await betterAuth.getSession(ctx);
  if (!session || (session.user as Record<string, unknown>).role !== role) {
    throw new Error(`Unauthorized: requires ${role}`);
  }
  return session.user;
}
