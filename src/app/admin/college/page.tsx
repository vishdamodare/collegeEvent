import { getOrganizerProfile } from "@/actions/admin";
import CollegeProfileClient from "@/components/admin/CollegeProfileClient";
import { campusFor } from "@/lib/campuses";

export const dynamic = "force-dynamic";

export default async function CollegeProfilePage() {
  const profile = await getOrganizerProfile();
  const campus = campusFor(profile.college);
  return (
    <CollegeProfileClient
      initialProfile={profile}
      pageDefaults={{ slug: campus?.slug ?? null, credentials: campus?.brand?.credentials ?? [], accent: campus?.brand?.accent ?? null }}
    />
  );
}
