"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { verifyEmailAction } from "@/actions/auth/verifyEmail";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in URL. Please check your email link.");
      return;
    }

    const verify = async () => {
      const result = await verifyEmailAction(token);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Token verification failed.");
      }
    };

    verify();
  }, [token]);

  return (
    <AuthCard>
      <div className="py-6 flex flex-col items-center text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-[var(--color-lime)] animate-spin mb-6"></div>
            <h2 className="text-[24px] font-anton uppercase mb-2">Verifying Email</h2>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Please wait while we verify your email token...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-lime)]/20 text-[var(--color-lime)] border border-[var(--color-lime)]/30 flex items-center justify-center text-[32px] mb-6 shadow-[0_0_20px_rgba(215,255,61,0.2)]">
              ✓
            </div>
            <h2 className="text-[26px] font-anton uppercase mb-2">Verification Success</h2>
            <p className="text-[14.5px] text-white/70 mb-8 max-w-xs leading-relaxed">
              Your email address has been verified successfully. You can now log in to your account.
            </p>
            <Link 
              href="/login" 
              className="btn btn-primary w-full py-[16px] text-[16px] font-bold shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]"
            >
              Log in to Account
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[32px] mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              ✕
            </div>
            <h2 className="text-[26px] font-anton uppercase mb-2">Verification Failed</h2>
            <p className="text-[14.5px] text-red-400/80 mb-8 max-w-xs leading-relaxed">
              {errorMessage}
            </p>
            <Link href="/login" className="text-[var(--color-lime)] font-bold hover:underline transition-all">
              Return to Login
            </Link>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-8">Loading verification parameters...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
