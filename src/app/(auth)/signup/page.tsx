"use client";

import { useState } from "react";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { StudentSignupWizard } from "@/components/auth/StudentSignupWizard";
import { AdminSignupWizard } from "@/components/auth/AdminSignupWizard";

type SignupRole = "none" | "student" | "admin";

export default function SignupPage() {
  const [role, setRole] = useState<SignupRole>("none");

  return (
    <>
      {role === "none" && (
        <RoleSelection onSelectRole={(selected) => setRole(selected)} />
      )}
      
      {role === "student" && (
        <StudentSignupWizard onBack={() => setRole("none")} />
      )}
      
      {role === "admin" && (
        <AdminSignupWizard onBack={() => setRole("none")} />
      )}
    </>
  );
}
