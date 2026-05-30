import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { NextRequest, NextResponse } from "next/server";

const { isAuthenticated } = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

const PROTECTED_PATHS = [
  "/buses",
  "/alerts",
  "/setup",
  "/driver",
  "/parent",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/buses/:path*",
    "/alerts/:path*",
    "/setup/:path*",
    "/driver/:path*",
    "/parent/:path*",
  ],
};
