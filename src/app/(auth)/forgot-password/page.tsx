"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { forgotPasswordAction } from "@/actions/auth/forgotPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const result = await forgotPasswordAction({ email });
    setIsSubmitting(false);

    if (result.success) {
      setMessage(result.message || "Reset link sent successfully");
    } else {
      setError(result.error || "An error occurred");
    }
  };

  return (
    <AuthCard>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-[16px] bg-[var(--color-lime)]/10 text-[var(--color-lime)] flex items-center justify-center text-[24px] mb-6 border border-[var(--color-lime)]/20 shadow-[0_0_20px_rgba(215,255,61,0.15)]">
          🔑
        </div>
        <h2 className="text-[28px] font-anton uppercase tracking-tight mb-2">
          Forgot Password?
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)]">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 text-[var(--color-lime)] text-[14px] mb-6 font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] mb-6 font-semibold">
          {error}
        </div>
      )}

      {!message && (
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

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary w-full py-[16px] text-[16px] mt-2 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] flex justify-center items-center cursor-pointer font-bold"
          >
            {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Send Reset Link"}
          </button>
        </form>
      )}

      <div className="text-center mt-8 text-[14px] text-[var(--color-text-muted)]">
        Remember your password?{" "}
        <Link href="/login" className="text-[var(--color-lime)] font-bold hover:underline transition-all">
          Log in
        </Link>
      </div>
    </AuthCard>
  );
}
