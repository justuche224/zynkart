import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    return NextResponse.next();
  }

  // Get the host from the request headers.
  // In production, this will be something like "tenant.mysite.com" or "www.mysite.com"
  // In local development, to simulate subdomains edit OS host file.
  const host = req.headers.get("host") || "";

  // Define which hosts should be considered the "main" domain.
  const mainDomains = ["zynkart.store", "localhost:3000", "www.zynkart.store"];

  // Determine if we’re on a main domain or on a tenant subdomain.
  const isMainDomain = mainDomains.includes(host);

  // If not on a main domain, assume the first segment is the tenant identifier.
  let tenant = null;
  if (!isMainDomain) {
    // For example: "tenant.mysite.com" -> "tenant"
    const hostParts = host.split(".");
    tenant = hostParts[0];
  }

  // ─────────────────────────────────────────────────────────────
  //  Tenant Rewriting Logic
  //
  // If we're on a tenant subdomain and the pathname is *not* already
  // a store route (or an auth route), then rewrite to /store/[tenant]...
  // For example: "tenant.mysite.com/cart" becomes "/store/tenant/cart"
  //
  // We allow the /store/auth routes and /api routes to bypass rewriting.
  // to bypass rewriting.
  // ─────────────────────────────────────────────────────────────

  if (
    tenant &&
    !pathname.startsWith("/api")
  ) {
    // Modify the pathname by injecting the tenant identifier.
    nextUrl.pathname = `/store/${tenant}${pathname}`;
    return NextResponse.rewrite(nextUrl);
  }

  //   ─────────────────────────────────────────────────────────────
  //  Auth and Public Routes Logic
  //  ─────────────────────────────────────────────────────────────

  const isLoggedIn = !!getSessionCookie(req);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isStoreRoute = pathname.startsWith("/store");

  // Let store pages (the rewritten tenant requests) pass through unprotected.
  if (isStoreRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // For any other route on the main domain, if the user is not logged in, redirect to sign in.
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
