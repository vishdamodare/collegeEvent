"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "./AuthCard";
import { SocialLogin } from "./SocialLogin";
import { registerStudentAction } from "@/actions/auth/registerStudent";

interface StudentSignupWizardProps {
  onBack?: () => void;
}

const inputClass =
  "w-full px-4 py-3.5 rounded-[12px] bg-card border border-border text-text-main text-[15px] outline-none transition-colors placeholder:text-text-faint focus:border-[var(--color-lime)]";

// One-screen sign-up: name, email, college, password. Branch/year/interests
// are optional and can be added later from the profile page.
export function StudentSignupWizard({ onBack }: StudentSignupWizardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !college.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await registerStudentAction({ name, email, college, password });
      if (res.success) setDone(true);
      else setError(res.error || "Sign up failed");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard className="max-w-[540px]">
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <div className="w-[76px] h-[76px] rounded-full bg-[var(--color-lime)]/15 border border-[var(--color-lime)]/30 flex items-center justify-center text-[36px] text-[var(--color-lime)]">
            ✓
          </div>
          <h3 className="text-[28px] font-anton uppercase">You&apos;re in!</h3>
          <p className="text-[15px] text-text-muted max-w-sm leading-relaxed">
            Your account is ready. Log in to start discovering events — you can add your branch, year and interests from your profile anytime.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="btn btn-primary w-full mt-2 py-[16px] font-bold cursor-pointer"
          >
            Log in
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard className="max-w-[540px]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 sm:mb-0 sm:absolute sm:top-6 sm:left-6 text-[13px] font-bold text-text-faint hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      )}

      <div className={`mb-6 text-center ${onBack ? "sm:mt-6" : ""}`}>
        <h2 className="text-[26px] sm:text-[28px] font-anton uppercase tracking-tight leading-[1.05] mb-2">
          Create your account
        </h2>
        <p className="text-[14px] text-text-muted">Takes 30 seconds. That&apos;s it.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] mb-5 font-semibold text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <input
          type="text"
          placeholder="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-label="Full name"
        />
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          aria-label="Email"
        />
        <input
          type="text"
          placeholder="College / University"
          autoComplete="organization"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          className={inputClass}
          aria-label="College or university"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (8+ characters)"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12`}
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-faint hover:text-text-main cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-3 py-[16px] text-[16px] font-bold flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-[1px] flex-1 bg-border"></div>
        <span className="text-[11px] font-bold text-text-faint uppercase tracking-wider">or sign up with</span>
        <div className="h-[1px] flex-1 bg-border"></div>
      </div>

      <SocialLogin callbackURL="/auth-callback?targetRole=student" />

      <p className="text-center mt-6 text-[14px] text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-lime)] font-bold hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
