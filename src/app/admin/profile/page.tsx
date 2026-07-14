import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrganizerProfileForm } from "./OrganizerProfileForm";

export default async function OrganizerProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const initialData = {
    name: session.user.name,
    college: profile?.college || "",
    department: profile?.department || "",
    position: profile?.position || "",
    verificationStatus: profile?.verificationStatus || "PENDING",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Organizer Profile</h1>
        <p className="text-text-faint mt-1">Update your organization, position, and user profile information.</p>
      </div>

      <OrganizerProfileForm initialData={initialData} />
    </div>
  );
}
