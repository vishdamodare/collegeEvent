"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { completeOAuthStudentOnboardingAction } from "@/actions/auth/oauth";

// Google sign-ups already give us name + email; we only need the college.
// Branch, year and interests can be added later from the profile page.
export default function StudentOnboardingPage() {
  const router = useRouter();
  const [college, setCollege] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college.trim()) {
      setError("Please enter your college");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await completeOAuthStudentOnboardingAction({ college });
    setIsSubmitting(false);
    if (result.success) router.push("/dashboard");
    else setError(result.error || "Failed to save. Please try again.");
  };

  return (
    <AuthCard className="max-w-[540px]">
      <div className="mb-6 text-center">
        <h2 className="text-[26px] sm:text-[28px] font-anton uppercase tracking-tight leading-[1.05] mb-2">
          One last thing
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)]">
          Which college are you from?
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] mb-5 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="College / University"
          autoComplete="organization"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          aria-label="College or university"
          className="w-full px-4 py-3.5 rounded-[12px] bg-card border border-border text-text-main text-[15px] outline-none transition-colors placeholder:text-text-faint focus:border-[var(--color-lime)]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full py-[16px] text-[16px] font-bold flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : "Go to my dashboard"}
        </button>
      </form>
    </AuthCard>
  );
}
