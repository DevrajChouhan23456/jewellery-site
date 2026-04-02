import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers for all routes
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
    const origin = request.headers.get("origin");
    
    if (allowedOrigins.includes(origin || "")) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
