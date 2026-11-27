import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { SuperNav, SuperTheme } from "@/components/superadmin/Controls";

export const metadata: Metadata = { title: "Super Admin — CollegeEvent", robots: { index: false } };

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireSuperAdmin();
  const [pending, newInquiries] = await Promise.all([
    prisma.organizerProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    // Dark by default; <SuperTheme /> pins the site theme to dark and applies this area's own saved light/dark choice
    <div id="sa-root" className="min-h-screen bg-sa-bg text-sa-fg font-archivo lg:flex">
      <SuperTheme />
      <SuperNav pending={pending} newInquiries={newInquiries} name={me.name} />
      <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-10">{children}</main>
    </div>
  );
}
