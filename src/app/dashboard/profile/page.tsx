import { getStudentProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const profile = await getStudentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          Profile
        </h1>
        <p className="text-text-faint mt-1">Manage your personal information and preferences.</p>
      </div>

      <ProfileForm
        initialData={
          profile
            ? {
                name: profile.user.name,
                college: profile.college,
                branch: profile.branch,
                academicYear: profile.academicYear,
                bio: profile.bio ?? "",
                interests: profile.interests,
                profileImage: profile.profileImage ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
