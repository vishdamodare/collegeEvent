import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { campusFor } from "@/lib/campuses";

export const metadata = {
  title: "Admin Dashboard — CollegeEvent",
  // Private organizer console: never index (access itself is enforced by auth, not by this)
  robots: { index: false, follow: false },
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
    // Logo shown in the sidebar: the one set on the public page, else the campus default
    logo: user.organizerProfile?.pageLogo || campusFor(user.organizerProfile?.college)?.logo || null,
  };

  return (
    <>
      <AdminShell profile={profile}>{children}</AdminShell>
    </>
  );
}
