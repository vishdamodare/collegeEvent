"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialLogin } from "@/components/auth/SocialLogin";

export default function LoginPage() {
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

      <form className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-white/70">Email Address</label>
          <input 
            type="email" 
            placeholder="you@college.edu" 
            required
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
            className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" 
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer mt-1 mb-2">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] focus:ring-offset-gray-900" />
          <span className="text-[13px] text-[var(--color-text-muted)]">Remember me for 30 days</span>
        </label>

        <button type="submit" className="btn btn-primary w-full py-[16px] text-[16px] mt-2 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]">
          Sign In
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
