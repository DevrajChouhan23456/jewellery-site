import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { buildAdminAccessPath } from "@/lib/admin-gate";
import {
  DEFAULT_ADMIN_DASHBOARD_PATH,
  normalizeRole,
} from "@/lib/auth-routes";

// CSRF token validation for state-changing requests
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_EXEMPT_ROUTES = [
  "/api/auth", // NextAuth handles its own security
  "/api/search", // Read-only
  "/api/products", // Read-only
  "/api/recommendations", // Read-only
  "/api/slider", // Read-only
  "/api/logo", // Read-only
  "/api/webhooks", // Webhooks verify via signature, not CSRF
];
const ADMIN_API_PREFIXES = ["/api/admin", "/api/user/reset", "/api/user/update"];

function isCsrfExempt(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route));
}

function isStateChangingMethod(method: string): boolean {
  return ["POST", "PATCH", "DELETE", "PUT"].includes(method);
}

function isAdminApiRoute(pathname: string) {
  return ADMIN_API_PREFIXES.some((route) => pathname.startsWith(route));
}

function applyHeaders(target: NextResponse, headers: Headers) {
  headers.forEach((value, key) => {
    target.headers.set(key, value);
  });

  return target;
}

function getTokenRole(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token || typeof token === "string") {
    return "USER";
  }

  return normalizeRole(token.role);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  let tokenPromise: ReturnType<typeof getToken> | null = null;

  const getAuthToken = () => {
    if (!tokenPromise) {
      tokenPromise = getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
    }

    return tokenPromise;
  };

  // Security headers for all routes
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.razorpay.com checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' api.razorpay.com; frame-src checkout.razorpay.com");

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
    const origin = request.headers.get("origin");
    
    if (allowedOrigins.includes(origin || "")) {
      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", `Content-Type,Authorization,${CSRF_HEADER_NAME}`);
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }

    // CSRF validation for state-changing requests (except auth which handles its own security)
    if (
      isStateChangingMethod(request.method) &&
      !isCsrfExempt(request.nextUrl.pathname)
    ) {
      const csrfToken = request.headers.get(CSRF_HEADER_NAME);
      
      // In development, allow missing token; in production, enforce
      if (process.env.NODE_ENV === "production" && !csrfToken) {
        return NextResponse.json(
          { error: "CSRF token validation failed" },
          { status: 403 }
        );
      }
    }
  }

  if (request.nextUrl.pathname === "/admin/login") {
    const token = await getAuthToken();

    if (token && getTokenRole(token) === "ADMIN") {
      return applyHeaders(
        NextResponse.redirect(
          new URL(DEFAULT_ADMIN_DASHBOARD_PATH, request.url),
        ),
        response.headers,
      );
    }

    return response;
  }

  if (isAdminApiRoute(request.nextUrl.pathname)) {
    const token = await getAuthToken();

    if (!token) {
      return applyHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        response.headers,
      );
    }

    if (getTokenRole(token) !== "ADMIN") {
      return applyHeaders(
        NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        response.headers,
      );
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = await getAuthToken();

    if (!token) {
      return applyHeaders(
        NextResponse.redirect(
          new URL(
            buildAdminAccessPath(
              `${request.nextUrl.pathname}${request.nextUrl.search}`,
            ),
            request.url,
          ),
        ),
        response.headers,
      );
    }

    if (getTokenRole(token) !== "ADMIN") {
      return applyHeaders(
        NextResponse.redirect(new URL("/unauthorized", request.url)),
        response.headers,
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
