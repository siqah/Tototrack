// Auth is handled through Convex HTTP actions (convex/auth.ts + convex/http.ts).
// Next.js proxies auth requests via app/api/auth/[...all]/route.ts using
// convexBetterAuthNextJs from @convex-dev/better-auth/nextjs.
// Use lib/auth-client.ts for client-side hooks (signIn, signOut, useSession).
