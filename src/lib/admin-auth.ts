import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// One session + DB lookup per request, shared by admin/layout.tsx and every admin action it renders.
// Role comes from the DB (not the 5-min session cookie cache) so a revoked admin loses access immediately.
export const getAdminUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { session: null, user: null };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organizerProfile: true },
  });
  return { session, user };
});
