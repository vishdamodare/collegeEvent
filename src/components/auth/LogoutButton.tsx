"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.replace("/login"); // hard nav drops cached protected pages
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
