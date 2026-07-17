import { DashboardSummary } from "@/types/admin";

export const MOCK_DASHBOARD: DashboardSummary = {
  quickStats: {
    totalEvents: 6,
    upcomingEvents: 2,
    draftEvents: 1,
    archivedEvents: 1,
    totalRegistrations: 382,
    todayRegistrations: 14,
    pendingApprovals: 6,
    revenue: 125800,
    certificatesGenerated: 124,
    pendingCertificates: 258,
  },
  recentPayments: [
    {
      id: "pay-1",
      eventName: "National Coding Hackathon 2026",
      participantName: "Rohan Sawant",
      amount: 299,
      status: "SUCCESS",
      date: "2026-07-14T21:45:00Z",
    },
    {
      id: "pay-2",
      eventName: "Robotics Arena & RC Challenge",
      participantName: "Nikhil Joshi",
      amount: 499,
      status: "SUCCESS",
      date: "2026-07-14T18:30:00Z",
    },
    {
      id: "pay-3",
      eventName: "National Coding Hackathon 2026",
      participantName: "Tanvi Deshmukh",
      amount: 299,
      status: "PENDING",
      date: "2026-07-14T16:40:00Z",
    },
  ],
  recentRegistrations: [
    {
      id: "reg-1",
      eventName: "National Coding Hackathon 2026",
      participantName: "Rohan Sawant",
      college: "D.Y. Patil College of Engineering",
      date: "2026-07-14T21:45:00Z",
    },
    {
      id: "reg-2",
      eventName: "Robotics Arena & RC Challenge",
      participantName: "Nikhil Joshi",
      college: "VJTI, Mumbai",
      date: "2026-07-14T18:30:00Z",
    },
    {
      id: "reg-3",
      eventName: "National Coding Hackathon 2026",
      participantName: "Tanvi Deshmukh",
      college: "Thadomal Shahani Engineering College",
      date: "2026-07-14T16:40:00Z",
    },
  ],
  recentActivities: [
    {
      id: "act-1",
      message: "Rohan Sawant registered for 'National Coding Hackathon 2026'",
      timestamp: "5 minutes ago",
      type: "registration",
    },
    {
      id: "act-2",
      message: "Nikhil Joshi completed payment for 'Robotics Arena'",
      timestamp: "3 hours ago",
      type: "payment",
    },
    {
      id: "act-3",
      message: "Event 'National Coding Hackathon 2026' status updated to Published",
      timestamp: "1 day ago",
      type: "event",
    },
    {
      id: "act-4",
      message: "Settings for notification email alerts updated",
      timestamp: "2 days ago",
      type: "system",
    },
  ],
  pendingTasks: [
    {
      id: "tsk-1",
      task: "Approve pending participants for Hackathon",
      dueDate: "July 16, 2026",
      completed: false,
    },
    {
      id: "tsk-2",
      task: "Upload Certificate Template for AI Symposium",
      dueDate: "July 18, 2026",
      completed: false,
    },
    {
      id: "tsk-3",
      task: "Review and publish Tarang Fest Draft",
      dueDate: "August 01, 2026",
      completed: false,
    },
  ],
};
