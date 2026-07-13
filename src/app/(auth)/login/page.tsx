"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { authClient } from "@/lib/auth-client";
import { loginAction } from "@/actions/auth/login";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (preCheck.role === "ORGANIZER") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error("Login authentication error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AuthCard>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-[16px] bg-[var(--color-lime)]/10 text-[var(--color-lime)] flex items-center justify-center text-[24px] mb-6 border border-[var(--color-lime)]/20 shadow-[0_0_20px_rgba(215,255,61,0.15)]">
          👋
        </div>
        <h2 className="text-[28px] font-anton uppercase tracking-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)]">
          Sign in to access your tickets and manage your events.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13.5px] mb-6 font-semibold font-archivo">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-white/70">Email Address</label>
          <input 
            type="email" 
            placeholder="you@college.edu" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" 
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[13px] font-semibold text-white/70">Password</label>
            <Link href="/forgot-password" className="text-[12px] text-[var(--color-lime)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <input 
            type="password" 
            placeholder="••••••••" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" 
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer mt-1 mb-2">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] focus:ring-offset-gray-900 cursor-pointer" 
          />
          <span className="text-[13px] text-[var(--color-text-muted)]">Remember me for 30 days</span>
        </label>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary w-full py-[16px] text-[16px] mt-2 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] flex justify-center items-center cursor-pointer font-bold"
        >
          {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-[var(--color-border)]"></div>
        <span className="text-[11px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">or continue with</span>
        <div className="h-[1px] flex-1 bg-[var(--color-border)]"></div>
      </div>

      <SocialLogin />

      <div className="text-center mt-8 text-[14px] text-[var(--color-text-muted)]">
        Don't have an account?{" "}
        <Link href="/signup" className="text-[var(--color-lime)] font-bold hover:underline transition-all">
          Create one
        </Link>
      </div>
    </AuthCard>
  );
}
