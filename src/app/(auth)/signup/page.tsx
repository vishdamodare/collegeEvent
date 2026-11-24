import { StudentSignupWizard } from "@/components/auth/StudentSignupWizard";
import { safeRedirect } from "@/utils/safeRedirect";

// Student sign-up only. Organizers sign up at /organizer.
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <StudentSignupWizard callbackUrl={safeRedirect(callbackUrl)} />;
}
