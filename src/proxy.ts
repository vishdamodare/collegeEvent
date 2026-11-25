import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { prisma } from "@/lib/prisma";
import { campusBySlug } from "@/lib/campuses";

// Unmatched internal path: rewriting here renders app/not-found.tsx with a real 404 status
const NOT_FOUND_PATH = "/__not-found";

/**
 * Event and college pages stream (loading.tsx), and a streamed response is committed to 200 before
 * the page can call notFound(). Search engines then index missing pages as "soft 404s". Checking that
 * the slug exists here, before rendering, lets missing pages return a real HTTP 404.
 * Only GET/HEAD: server actions POST to these URLs and must pass through untouched.
 */
async function missingPublicPage(request: NextRequest): Promise<boolean> {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const [, section, slug, extra] = request.nextUrl.pathname.split("/");
  if (!slug || extra !== undefined) return false;
  if (section === "colleges") return !campusBySlug(slug);
  if (section === "events") {
    try {
      // Existence only (drafts still reach the page, which handles organizer previews itself)
      return !(await prisma.event.findUnique({ where: { slug: decodeURIComponent(slug) }, select: { id: true } }));
    } catch {
      return false; // DB hiccup: let the page render rather than wrongly 404 a real event
    }
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (await missingPublicPage(request)) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  // Handles the "__Secure-" prefix Better Auth adds on HTTPS (cookie names are case-sensitive)
  const sessionToken = getSessionCookie(request);

  // Protected routes requiring an active session
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/superadmin") ||
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
    "/superadmin/:path*",
    "/pending-approval",
    "/signup/student-onboarding",
    "/events/:slug",
    "/colleges/:slug",
  ],
};

export default proxy;
