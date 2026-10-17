import { getOrganizerProfile } from "@/actions/admin";
import { OrganizerProfileForm } from "./OrganizerProfileForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile — CollegeEvents Admin",
};

export default async function ProfilePage() {
  // Only the fetch can fail; JSX stays outside try/catch so render errors reach the error boundary
  let profile: Awaited<ReturnType<typeof getOrganizerProfile>>;
  try {
    profile = await getOrganizerProfile();
  } catch {
    redirect("/login");
  }

  return (
    <div className="space-y-8 font-archivo text-white">
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Organizer Profile</h1>
        <p className="text-[13px] text-white/40">Manage your personal coordinator details, institution parameters, and verification status.</p>
      </div>

      <OrganizerProfileForm initialData={profile} />
    </div>
  );
}
