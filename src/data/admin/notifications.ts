import { AdminNotification } from "@/types/admin";

export let MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    title: "New Registration Received",
    message: "Rohan Sawant has registered for 'National Coding Hackathon 2026' representing CodeBusters.",
    category: "REGISTRATIONS",
    date: "2026-07-14T21:45:00Z",
    isRead: false,
    isArchived: false,
  },
  {
    id: "notif-2",
    title: "Payment Credited",
    message: "Payment of INR 499 from Nikhil Joshi for 'Robotics Arena' completed successfully via Netbanking.",
    category: "PAYMENTS",
    date: "2026-07-14T18:30:00Z",
    isRead: false,
    isArchived: false,
  },
  {
    id: "notif-3",
    title: "Event Draft Published",
    message: "Your event 'National Coding Hackathon 2026' was successfully published and is now open for registration.",
    category: "APPROVALS",
    date: "2026-07-13T10:00:00Z",
    isRead: true,
    isArchived: false,
  },
  {
    id: "notif-4",
    title: "Admin Account Verified",
    message: "Congratulations! Your college event organizer profile has been officially approved. You can now publish paid events.",
    category: "VERIFICATION",
    date: "2026-07-12T15:00:00Z",
    isRead: true,
    isArchived: false,
  },
  {
    id: "notif-5",
    title: "Platform Maintenance Completed",
    message: "CollegeEvents team successfully updated the checkout experience and server routes for faster ticketing.",
    category: "SYSTEM",
    date: "2026-07-11T04:00:00Z",
    isRead: true,
    isArchived: true,
  },
];

export function markAsRead(id: string): boolean {
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
  if (index !== -1) {
    MOCK_NOTIFICATIONS[index].isRead = true;
    return true;
  }
  return false;
}

export function archiveNotification(id: string): boolean {
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
  if (index !== -1) {
    MOCK_NOTIFICATIONS[index].isArchived = true;
    return true;
  }
  return false;
}
