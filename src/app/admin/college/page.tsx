import { getOrganizerProfile } from "@/actions/admin";
import CollegeProfileClient from "@/components/admin/CollegeProfileClient";

export const dynamic = "force-dynamic";

export default async function CollegeProfilePage() {
  const profile = await getOrganizerProfile();
  return <CollegeProfileClient initialProfile={profile} />;
}
