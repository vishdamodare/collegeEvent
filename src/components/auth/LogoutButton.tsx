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
      className="px-6 py-3.5 rounded-xl bg-card border border-border text-text-main font-bold hover:bg-card-hover transition-all cursor-pointer text-center"
    >
      Log Out
    </button>
  );
}
