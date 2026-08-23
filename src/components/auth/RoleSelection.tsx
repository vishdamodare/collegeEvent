"use client";

import { motion } from "framer-motion";
import { AuthCard } from "./AuthCard";
import { SocialLogin } from "./SocialLogin";
import Link from "next/link";

interface RoleSelectionProps {
  onSelectRole: (role: "student" | "admin") => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <AuthCard className="max-w-[540px]">
      <div className="mb-8 text-center">
        <h2 className="text-[28px] font-anton uppercase tracking-tight mb-2">
          How will you use CollegeEvents?
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)]">
          Select your role to customize your onboarding experience.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("student")}
          className="p-6 rounded-[24px] bg-[#141414] border border-[#2A2A2A] hover:border-[var(--color-lime)] cursor-pointer group transition-colors relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-lime)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex gap-5">
            <div className="w-14 h-14 rounded-full bg-[var(--color-lime)]/10 text-[var(--color-lime)] flex items-center justify-center text-[28px] flex-none">
              🎓
            </div>
            <div>
              <h3 className="text-[16px] font-bold font-archivo mb-1 text-white group-hover:text-[var(--color-lime)] transition-colors">
                Student
              </h3>
              <p className="text-[13.5px] text-[var(--color-text-muted)] leading-[1.5]">
                Discover hackathons, tech fests, workshops, sports, and music festivals. Connect with students across campuses.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("admin")}
          className="p-6 rounded-[24px] bg-[#141414] border border-[#2A2A2A] hover:border-[var(--color-cobalt)] cursor-pointer group transition-colors relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cobalt)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex gap-5">
            <div className="w-14 h-14 rounded-full bg-[var(--color-cobalt)]/10 text-[var(--color-cobalt)] flex items-center justify-center text-[28px] flex-none">
              🏛
            </div>
            <div>
              <h3 className="text-[16px] font-bold font-archivo mb-1 text-white group-hover:text-[var(--color-cobalt)] transition-colors">
                Event Organizer
              </h3>
              <p className="text-[13.5px] text-[var(--color-text-muted)] leading-[1.5]">
                Create, manage, promote and analyze college events for your institution. Official verification required.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-[var(--color-border)]"></div>
        <span className="text-[11px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">or sign up with</span>
        <div className="h-[1px] flex-1 bg-[var(--color-border)]"></div>
      </div>

      <SocialLogin callbackURL="/auth-callback?targetRole=student" />

      <div className="text-center mt-6 text-[14px] text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-bold hover:underline transition-all">
          Log in
        </Link>
      </div>
    </AuthCard>
  );
}
