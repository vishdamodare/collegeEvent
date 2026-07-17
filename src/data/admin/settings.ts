import { AdminSettings } from "@/types/admin";

export let MOCK_SETTINGS: AdminSettings = {
  profile: {
    name: "Dr. Sandeep Kamble",
    email: "sandeep.kamble@vit.edu",
    phone: "+91 98765 43210",
    college: "Vidyalankar Institute of Technology",
    department: "Information Technology",
    position: "Faculty / Professor",
  },
  notifications: {
    emailAlerts: true,
    weeklyDigest: false,
    registrationAlerts: true,
    paymentAlerts: true,
  },
  team: [
    {
      id: "team-1",
      name: "Dr. Sandeep Kamble",
      email: "sandeep.kamble@vit.edu",
      role: "OWNER",
      status: "ACTIVE",
      addedAt: "2026-06-25T14:30:00Z",
    },
    {
      id: "team-2",
      name: "Aditya Verma",
      email: "aditya.v@student.vit.edu",
      role: "ADMIN",
      status: "ACTIVE",
      addedAt: "2026-06-26T10:00:00Z",
    },
    {
      id: "team-3",
      name: "Shruti Hegde",
      email: "shruti.hegde@vit.edu",
      role: "EDITOR",
      status: "PENDING",
      addedAt: "2026-07-12T11:00:00Z",
    },
  ],
};

export function updateProfile(profileData: typeof MOCK_SETTINGS.profile) {
  MOCK_SETTINGS.profile = profileData;
  return true;
}

export function updateNotifications(notificationPrefs: typeof MOCK_SETTINGS.notifications) {
  MOCK_SETTINGS.notifications = notificationPrefs;
  return true;
}

export function addTeamMember(member: Omit<typeof MOCK_SETTINGS.team[0], "id" | "status" | "addedAt">) {
  const newMember = {
    ...member,
    id: `team-${Math.random().toString(36).substr(2, 9)}`,
    status: "PENDING" as const,
    addedAt: new Date().toISOString(),
  };
  MOCK_SETTINGS.team.push(newMember);
  return newMember;
}
