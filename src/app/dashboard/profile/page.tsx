import { getStudentProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { RegistrationHistory } from "@/components/dashboard/RegistrationHistory";

export default async function ProfilePage() {
  const profile = await getStudentProfile();
  const registrations = profile?.registrations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          Profile
        </h1>
        <p className="text-text-faint mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfileForm
            initialData={
              profile
                ? {
                    name: profile.user.name,
                    college: profile.college,
                    branch: profile.branch,
                    academicYear: profile.academicYear,
                    bio: profile.bio ?? "",
                    phoneNumber: profile.phoneNumber ?? "",
                    gender: profile.gender ?? "",
                    studentId: profile.studentId ?? "",
                    interests: profile.interests,
                    profileImage: profile.profileImage ?? "",
                  }
                : undefined
            }
          />
        </div>
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
          <RegistrationHistory registrations={registrations} />
        </div>
      </div>
    </div>
  );
}
