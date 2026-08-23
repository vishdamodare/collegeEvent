import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Extract Better Auth session token cookie directly from request cookies
  const sessionToken = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__secure-better-auth.session_token");

  // Protected routes requiring an active session
  const isProtectedRoute = 
    path.startsWith("/dashboard") || 
    path.startsWith("/admin") || 
    path.startsWith("/pending-approval") || 
    path === "/signup/student-onboarding";

  // 1. Redirect unauthenticated visitors attempting to access protected pages to /login
  if (!sessionToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/pending-approval",
    "/signup/student-onboarding",
  ],
};

export default proxy;
