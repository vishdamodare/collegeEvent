"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { authClient } from "@/lib/auth-client";
import { loginAction } from "@/actions/auth/login";
import { safeRedirect } from "@/utils/safeRedirect";

const subscribeNoop = () => () => {};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // true only in the browser (reads window.location below)
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (!mounted) {
    return null;
  }

  // Where to return after login (e.g. the event the student was registering for)
  const callbackUrl = safeRedirect(new URLSearchParams(window.location.search).get("callbackUrl"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Trigger the server-side validator & role status check action
    const preCheck = await loginAction({ email, password });

    if (!preCheck.success) {
      setIsSubmitting(false);
      setError(preCheck.error || "Login precheck failed");
      return;
    }

    // 2. Perform the actual authentication with Better Auth
    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      setIsSubmitting(false);

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
      } else {
        // Successful login: Redirect based on role
        if (preCheck.role === "SUPER_ADMIN") {
          router.push(callbackUrl?.startsWith("/superadmin") ? callbackUrl : "/superadmin");
        } else if (preCheck.role === "ORGANIZER") {
          router.push(callbackUrl?.startsWith("/admin") ? callbackUrl : "/admin");
        } else {
          router.push(callbackUrl ?? "/dashboard");
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("Login authentication error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-card border border-border text-text-main text-[15px] outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-text-faint";

  return (
    <AuthCard>
      <div className="mb-7">
        <h2 className="text-[30px] sm:text-[34px] leading-tight">Log in</h2>
        <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">Welcome back. Your tickets and registrations are waiting.</p>
      </div>

      <SocialLogin
        callbackURL={`/auth-callback?targetRole=student${
          callbackUrl ? `&next=${encodeURIComponent(callbackUrl)}` : ""
        }`}
      />

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-[var(--color-border)]"></div>
        <span className="text-[13px] text-[var(--color-text-faint)]">or use your email</span>
        <div className="h-px flex-1 bg-[var(--color-border)]"></div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[14px] mb-5 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="block text-[14px] font-semibold mb-1.5">Email</label>
          <input
            id="login-email"
            suppressHydrationWarning
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="login-password" className="text-[14px] font-semibold">Password</label>
            <Link href="/forgot-password" className="text-[13px] text-[var(--color-lime)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            suppressHydrationWarning
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            suppressHydrationWarning
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--color-lime)] cursor-pointer"
          />
          <span className="text-[14px] text-[var(--color-text-muted)]">Keep me logged in for 30 days</span>
        </label>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-1 !py-[15px] text-[16px] flex justify-center items-center cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-[14px] text-[var(--color-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href={callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup"}
          className="text-[var(--color-lime)] font-semibold hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
