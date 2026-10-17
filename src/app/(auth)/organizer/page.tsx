"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { registerOrganizerAction } from "@/actions/auth/registerOrganizer";
import { loginAction } from "@/actions/auth/login";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/utils/cn";

const ROLES = [
  "Faculty Coordinator",
  "Student Coordinator",
  "Club / Society President",
  "Fest Committee Member",
  "Student Council",
  "Other",
];

const inputClass =
  "w-full px-4 py-3.5 rounded-[12px] bg-card border border-border text-text-main text-[15px] outline-none transition-colors placeholder:text-text-faint focus:border-[var(--color-cobalt)]";

type Tab = "signup" | "login";

// Organizer entry point: create an organizer account or log in, then land in /admin.
export default function OrganizerAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signup");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
  };

  const signIn = async () => {
    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) throw new Error(signInError.message || "Invalid email or password.");
    router.push("/admin");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !college.trim() || !department.trim() || !position || !password) {
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
      const res = await registerOrganizerAction({ name, email, phone, college, department, position, password });
      if (!res.success) {
        setError(res.error || "Sign up failed");
        return;
      }
      await signIn();
    } catch (err) {
      setError((err as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const pre = await loginAction({ email, password });
      if (!pre.success) {
        setError(pre.error || "Login failed");
        return;
      }
      await signIn();
    } catch (err) {
      setError((err as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordField = (autoComplete: string) => (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={tab === "signup" ? "Password (8+ characters)" : "Password"}
        autoComplete={autoComplete}
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
  );

  const submitButton = (label: string, busy: string) => (
    <button
      type="submit"
      disabled={isSubmitting}
      className="btn btn-primary w-full mt-2 py-[16px] text-[16px] font-bold flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
    >
      {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> {busy}</> : label}
    </button>
  );

  return (
    <AuthCard className="max-w-[540px]">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-cobalt)] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cobalt)]" /> For organizers
        </span>
        <h2 className="text-[26px] sm:text-[28px] font-anton uppercase tracking-tight leading-[1.05] mb-2">
          {tab === "signup" ? "Host events on CollegeEvents" : "Organizer log in"}
        </h2>
        <p className="text-[14px] text-text-muted">
          {tab === "signup"
            ? "Create your organizer account to publish events and manage registrations."
            : "Welcome back. Manage your events and check-ins."}
        </p>
      </div>

      {/* Sign up / Log in switch */}
      <div role="tablist" className="grid grid-cols-2 p-1 mb-6 rounded-full bg-[var(--color-bg-elevated)] border border-border">
        {(["signup", "login"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={cn(
              "py-2.5 rounded-full text-[14px] font-bold transition-colors cursor-pointer",
              tab === t ? "bg-card text-text-main shadow-sm" : "text-text-faint hover:text-text-main"
            )}
          >
            {t === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] mb-5 font-semibold text-center">
          {error}
        </div>
      )}

      {tab === "signup" ? (
        <form onSubmit={handleSignup} className="flex flex-col gap-3.5" noValidate>
          <input type="text" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} aria-label="Full name" />
          <input type="email" placeholder="Official email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-label="Official email" />
          <input type="tel" placeholder="Phone number" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} aria-label="Phone number" />
          <input type="text" placeholder="College / University" autoComplete="organization" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass} aria-label="College or university" />
          <input type="text" placeholder="Department / Club (e.g. Coding Club, CSE Dept)" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} aria-label="Department or club" />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            aria-label="Your role"
            className={cn(inputClass, "appearance-none cursor-pointer", !position && "text-text-faint")}
          >
            <option value="" disabled>Your role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {passwordField("new-password")}
          {submitButton("Create organizer account", "Creating account…")}
        </form>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5" noValidate>
          <input type="email" placeholder="Email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-label="Email" />
          {passwordField("current-password")}
          <Link href="/forgot-password" className="self-end text-[13px] font-semibold text-[var(--color-lime)] hover:underline">
            Forgot password?
          </Link>
          {submitButton("Log in", "Logging in…")}
        </form>
      )}

      <p className="text-center mt-6 text-[14px] text-text-muted">
        Not an organizer?{" "}
        <Link href="/signup" className="text-[var(--color-lime)] font-bold hover:underline">
          Join as a student
        </Link>
      </p>
    </AuthCard>
  );
}
