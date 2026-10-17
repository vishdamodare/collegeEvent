import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Handles the "__Secure-" prefix Better Auth adds on HTTPS (cookie names are case-sensitive)
  const sessionToken = getSessionCookie(request);

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
