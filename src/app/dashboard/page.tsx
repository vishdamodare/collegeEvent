import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-lime)]/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name} 
              className="w-24 h-24 rounded-full object-cover border border-white/10 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-lime)] to-[var(--color-coral)] flex items-center justify-center text-black text-[32px] font-anton shadow-lg flex-none">
              {session.user.name[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 w-full">
            <span className="px-3.5 py-1 rounded-full bg-[var(--color-lime)]/10 text-[var(--color-lime)] border border-[var(--color-lime)]/20 text-[12px] font-bold tracking-wider uppercase">
              Student Dashboard
            </span>
            <h1 className="text-[32px] font-anton uppercase mt-4 mb-2 leading-none">
              {session.user.name}
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mb-6 font-archivo">
              {session.user.email}
            </p>

            {profile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-5 rounded-2xl bg-white/5 border border-white/5 mb-8">
                <div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-0.5">Institution</span>
                  <p className="text-[14px] font-bold text-white/95">{profile.college}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-0.5">Branch / Major</span>
                  <p className="text-[14px] font-bold text-white/95">{profile.branch}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-0.5">Academic Year</span>
                  <p className="text-[14px] font-bold text-white/95">{profile.academicYear}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-0.5">Interests</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="px-2 py-0.5 rounded bg-white/5 text-[12px] font-semibold text-[var(--color-lime)] border border-[var(--color-lime)]/10">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 w-full justify-center md:justify-start">
              <Link 
                href="/" 
                className="px-6 py-3.5 rounded-xl bg-white text-black font-bold hover:shadow-lg transition-all text-center flex-1 sm:flex-none cursor-pointer"
              >
                Go to Homepage
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
