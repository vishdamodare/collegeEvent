export type NotificationCategory =
  | "REGISTRATIONS"
  | "PAYMENTS"
  | "APPROVALS"
  | "CERTIFICATES"
  | "VERIFICATION"
  | "ANNOUNCEMENTS"
  | "SYSTEM";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  date: string;
  isRead: boolean;
  isArchived: boolean;
}
