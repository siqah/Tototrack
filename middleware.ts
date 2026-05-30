import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/dashboard": ["school_admin", "operator"],
  "/buses": ["school_admin", "operator"],
  "/alerts": ["school_admin", "operator"],
  "/setup": ["school_admin", "operator"],
  "/driver": ["driver"],
  "/parent": ["parent"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const allowedRoles = PROTECTED_ROUTES[matchedPrefix];
  const userRole = (session.user as { role?: string }).role ?? "parent";

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/buses/:path*", "/alerts/:path*", "/setup/:path*", "/driver/:path*", "/parent/:path*"],
};
