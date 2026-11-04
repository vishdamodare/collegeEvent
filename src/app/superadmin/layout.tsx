import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { SuperNav } from "@/components/superadmin/Controls";

export const metadata: Metadata = { title: "Super Admin — CollegeEvents", robots: { index: false } };

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  const pending = await prisma.organizerProfile.count({ where: { verificationStatus: "PENDING" } });

  return (
    // Dark-only like the organizer console; forced via the inline script below so a saved light theme can't leak in
    <div className="min-h-screen bg-[#0A0A0A] text-white font-archivo">
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.setAttribute('data-theme','dark')` }} />
      <SuperNav pending={pending} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
