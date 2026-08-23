import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotificationsClient } from "@/components/dashboard/NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const notifications = session?.user?.id
    ? await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)] text-text-main">
          Notifications
        </h1>
        <p className="text-text-faint mt-1">Stay updated on events and announcements.</p>
      </div>

      <NotificationsClient notifications={notifications} />
    </div>
  );
}
