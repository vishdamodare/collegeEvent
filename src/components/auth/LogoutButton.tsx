"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh(); // Triggers app routing refresh
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all cursor-pointer text-center"
    >
      Log Out
    </button>
  );
}
