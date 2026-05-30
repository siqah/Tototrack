import { NextRequest, NextResponse } from "next/server";

// Better Auth session cookie name (default in better-auth v1.x)
const SESSION_COOKIE = "better-auth.session_token";

const PROTECTED_PATHS = [
  "/buses",
  "/alerts",
  "/setup",
  "/driver",
  "/parent",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (!sessionCookie) {
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
