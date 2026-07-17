import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Dashboard — CollegeEvents",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // Look up user role and status in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organizerProfile: true },
  });

  if (!user || user.role !== "ORGANIZER") {
    redirect("/unauthorized");
  }

  const profile = {
    name: user.name || "Organizer",
    email: user.email || "",
    college: user.organizerProfile?.college || "Your College",
    department: user.organizerProfile?.department || "General",
    position: user.organizerProfile?.position || "Coordinator",
  };

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
