"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

export default function UnauthorizedPage() {
  return (
    <AuthCard>
      <div className="py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[32px] mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          ⚠️
        </div>
        <h2 className="text-[26px] font-anton uppercase mb-2">Access Denied</h2>
        <p className="text-[14.5px] text-white/70 mb-8 max-w-xs leading-relaxed">
          You do not have the permission to access this resource. Please verify your login credentials or switch accounts.
        </p>
        
        <Link 
          href="/" 
          className="btn btn-primary w-full py-[16px] text-[16px] font-bold shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] text-center block"
        >
          Return to Home
        </Link>
      </div>
    </AuthCard>
  );
}
