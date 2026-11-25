import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-side guard for the platform owner area. Reads the role from the database (not the
 * 5-minute session cookie cache) so a demoted super admin loses access immediately.
 * Pages redirect; `mode: "throw"` is for server actions.
 */
const loadUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true } })
    : null;
  return { session, user };
});

export async function requireSuperAdmin(mode: "redirect" | "throw" = "redirect") {
  // cache(): layout + page share one session/DB lookup per request
  const { session, user } = await loadUser();

  if (!user || user.role !== "SUPER_ADMIN") {
    if (mode === "throw") throw new Error("Unauthorized");
    redirect(session?.user ? "/unauthorized" : "/login?callbackUrl=/superadmin");
  }
  return user;
}
