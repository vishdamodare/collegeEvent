import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Dashboard — CollegeEvents",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cached per request: the page's admin actions reuse this lookup instead of repeating it
  const { session, user } = await getAdminUser();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!user || (user.role !== "ORGANIZER" && user.role !== "SUPER_ADMIN")) {
    redirect("/unauthorized");
  }

  // If user is an organizer, check their verification approval status
  if (user.role === "ORGANIZER" && user.organizerProfile?.verificationStatus !== "APPROVED") {
    redirect("/pending-approval");
  }

  const profile = {
    name: user.name || "Organizer",
    email: user.email || "",
    college: user.organizerProfile?.college || "Your College",
    department: user.organizerProfile?.department || "General",
    position: user.organizerProfile?.position || (user.role === "SUPER_ADMIN" ? "Super Admin" : "Coordinator"),
  };

  return (
    <>
      {/* Runs before first paint so there's no light-theme flash; AdminShell keeps it in sync on client navigation */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.setAttribute('data-theme','dark')` }} />
      <AdminShell profile={profile}>{children}</AdminShell>
    </>
  );
}
