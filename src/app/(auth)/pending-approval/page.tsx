"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <AuthCard>
      <div className="py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-cobalt)]/20 text-[var(--color-cobalt)] border border-[var(--color-cobalt)]/30 flex items-center justify-center text-[32px] mb-6 shadow-[0_0_20px_rgba(77,159,255,0.2)]">
          ⏳
        </div>
        <h2 className="text-[26px] font-anton uppercase mb-2">Pending Approval</h2>
        <p className="text-[14.5px] text-white/70 mb-8 max-w-sm leading-relaxed">
          Your event organizer application has been received. Our team will review your verification documents within 24-48 hours. We will email you once your account is activated.
        </p>
        
        <button 
          onClick={handleLogout} 
          className="w-full py-[16px] rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    </AuthCard>
  );
}
