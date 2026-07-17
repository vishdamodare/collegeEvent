import { getOrganizerProfile } from "@/actions/admin";
import { OrganizerProfileForm } from "./OrganizerProfileForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile — CollegeEvents Admin",
};

export default async function ProfilePage() {
  try {
    const profile = await getOrganizerProfile();
    return (
      <div className="space-y-8 font-archivo text-white">
        <div>
          <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Organizer Profile</h1>
          <p className="text-[13px] text-white/40">Manage your personal coordinator details, institution parameters, and verification status.</p>
        </div>

        <OrganizerProfileForm initialData={profile} />
      </div>
    );
  } catch (err) {
    redirect("/login");
  }
}
