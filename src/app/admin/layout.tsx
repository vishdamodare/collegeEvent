import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserRole } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const user = session.user;
  if (user.role !== UserRole.ORGANIZER && user.role !== UserRole.SUPER_ADMIN) {
    redirect("/unauthorized");
  }

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </AdminShell>
  );
}
