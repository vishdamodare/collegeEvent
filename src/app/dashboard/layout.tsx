import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Look up user role and student profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true, organizerProfile: true },
  });

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Route organizers to their designated console
  if (user.role === "ORGANIZER") {
    if (user.organizerProfile?.verificationStatus === "APPROVED") {
      redirect("/admin");
    } else {
      redirect("/pending-approval");
    }
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // If student does not have a profile completed yet (e.g. fresh Google OAuth sign-in),
  // redirect them to complete their academic onboarding
  if (!user.studentProfile) {
    redirect("/signup/student-onboarding");
  }

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </DashboardShell>
  );
}
