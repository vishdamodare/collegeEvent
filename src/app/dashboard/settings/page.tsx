import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { StudentSettingsClient } from "@/components/dashboard/StudentSettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const profile = session?.user?.id
    ? await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          college: true,
          branch: true,
          academicYear: true,
          phoneNumber: true,
          phoneVerified: true,
        },
      })
    : null;

  return (
    <StudentSettingsClient
      user={{
        id: session?.user?.id || "",
        name: session?.user?.name || "Student",
        email: session?.user?.email || "",
        image: session?.user?.image,
      }}
      profile={profile}
    />
  );
}
