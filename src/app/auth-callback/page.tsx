"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkOAuthUserStatusAction } from "@/actions/auth/oauth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRole = searchParams.get("targetRole") || "student";

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const status = await checkOAuthUserStatusAction();
      if (!status.success || !status.user) {
        setError(status.error || "Authentication failed. Please try again.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      if (status.hasProfile) {
        if (status.role === "STUDENT") {
          router.push("/dashboard");
        } else if (status.role === "ORGANIZER") {
          if (status.organizerStatus === "APPROVED") {
            router.push("/admin");
          } else {
            router.push("/pending-approval");
          }
        }
      } else {
        // If no profile exists, redirect to onboarding steps
        if (targetRole === "admin" || targetRole === "organizer") {
          // Organizers cannot onboard solely via OAuth, they require document verification
          router.push("/signup");
        } else {
          router.push("/signup/student-onboarding");
        }
      }
    };

    handleCallback();
  }, [router, targetRole]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] text-white">
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#141414]/80 backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[32px] mb-6 mx-auto">
              ✕
            </div>
            <h2 className="text-[24px] font-anton uppercase mb-2">Auth Failure</h2>
            <p className="text-[14px] text-red-400/80 leading-relaxed">{error}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-[var(--color-lime)] animate-spin mb-6 mx-auto"></div>
            <h2 className="text-[24px] font-anton uppercase mb-2">Completing Sign-In</h2>
            <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed">
              Verifying your profile credentials and loading database session...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-anton text-[24px] tracking-wider">
        LOADING AUTHENTICATION SESSION...
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
