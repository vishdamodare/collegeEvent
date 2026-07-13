import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Extract Better Auth session token cookie directly from request cookies
  const sessionToken = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__secure-better-auth.session_token");

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/pending-approval");

  // 1. Redirect unauthenticated visitors attempting to access protected pages
  if (!sessionToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from guest-only pages
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/pending-approval",
  ],
};
