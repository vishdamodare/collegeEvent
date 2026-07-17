export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  addedAt: string;
}

export interface OrganizerProfileData {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  position: string;
}

export interface AdminSettings {
  profile: OrganizerProfileData;
  notifications: {
    emailAlerts: boolean;
    weeklyDigest: boolean;
    registrationAlerts: boolean;
    paymentAlerts: boolean;
  };
  team: TeamMember[];
}

export interface GlobalSettings {
  notificationsEnabled: boolean;
  emailLogsActive: boolean;
}
