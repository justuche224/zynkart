import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";

export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";

  const mainDomains = ["zynkart.store", "localhost:3000", "www.zynkart.store"];

  const isMainDomain = mainDomains.includes(host);

  let tenant = null;
  if (!isMainDomain) {
    const hostParts = host.split(".");
    tenant = hostParts[0];
  }

  if (
    tenant &&
    !pathname.startsWith("/api")
  ) {
    nextUrl.pathname = `/store/${tenant}${pathname}`;
    return NextResponse.rewrite(nextUrl);
  }

  const isLoggedIn = !!getSessionCookie(req);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isStoreRoute = pathname.startsWith("/store");

  if (isStoreRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
