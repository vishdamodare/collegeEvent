export interface QuickStats {
  totalEvents: number;
  upcomingEvents: number;
  draftEvents: number;
  archivedEvents: number;
  totalRegistrations: number;
  todayRegistrations: number;
  pendingApprovals: number;
  revenue: number;
  certificatesGenerated: number;
  pendingCertificates: number;
}

export interface RecentPayment {
  id: string;
  eventName: string;
  participantName: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  date: string;
}

export interface RecentRegistration {
  id: string;
  eventName: string;
  participantName: string;
  college: string;
  date: string;
}

export interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
  type: "registration" | "payment" | "event" | "system";
}

export interface PendingTask {
  id: string;
  task: string;
  dueDate: string;
  completed: boolean;
}

export interface DashboardSummary {
  quickStats: QuickStats;
  recentPayments: RecentPayment[];
  recentRegistrations: RecentRegistration[];
  recentActivities: RecentActivity[];
  pendingTasks: PendingTask[];
}
