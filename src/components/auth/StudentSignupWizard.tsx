"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "./AuthCard";
import { SocialLogin } from "./SocialLogin";
import { registerStudentAction } from "@/actions/auth/registerStudent";

interface StudentSignupWizardProps {
  onBack?: () => void;
  // Where to return after sign-up (e.g. the event the student was registering for)
  callbackUrl?: string | null;
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-card border border-border text-text-main text-[15px] outline-none transition-colors placeholder:text-text-faint focus:border-[var(--color-lime)]";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-semibold mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// One-screen sign-up: name, email, password. College, branch, year and interests come later.
export function StudentSignupWizard({ onBack, callbackUrl }: StudentSignupWizardProps) {
  const loginHref = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
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
      const res = await registerStudentAction({ name, email, password });
      if (res.success) setDone(true);
      else setError(res.error || "Sign up failed");
    } catch (err) {
      setError((err as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard>
        <div className="flex flex-col gap-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" aria-hidden />
          <h2 className="text-[30px] leading-tight">You&apos;re in.</h2>
          <p className="text-[15px] text-text-muted leading-relaxed max-w-sm">
            Your account is ready. Log in to browse events. You can add your branch, year and interests from your profile any time.
          </p>
          <button
            onClick={() => (window.location.href = loginHref)}
            className="btn btn-primary w-full mt-2 cursor-pointer"
          >
            Log in
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-[14px] font-semibold text-text-faint hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      )}

      <div className="mb-7">
        <h2 className="text-[30px] sm:text-[34px] leading-tight">Create your account</h2>
        <p className="mt-2 text-[15px] text-text-muted">Register for events and keep your tickets in one place.</p>
      </div>

      <SocialLogin
        callbackURL={`/auth-callback?targetRole=student${callbackUrl ? `&next=${encodeURIComponent(callbackUrl)}` : ""}`}
      />

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-border"></div>
        <span className="text-[13px] text-text-faint">or use your email</span>
        <div className="h-px flex-1 bg-border"></div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[14px] mb-5 font-medium"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field id="signup-name" label="Full name">
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="signup-email" label="Email">
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="signup-password" label="Password">
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
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
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-2 !py-[15px] text-[16px] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
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

      <p className="mt-7 text-[14px] text-text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="text-[var(--color-lime)] font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
