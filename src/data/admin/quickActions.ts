export interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    title: "Create Event",
    description: "Launch a new technical fest, hackathon, or seminar.",
    href: "/admin/events/create",
    icon: "PlusCircle",
    color: "lime",
  },
  {
    title: "Manage Events",
    description: "View drafts, edit content, or update lifecycle status.",
    href: "/admin/events",
    icon: "CalendarRange",
    color: "butter",
  },
  {
    title: "View Participants",
    description: "Approve registrations, check-in attendees, or export lists.",
    href: "/admin/participants",
    icon: "Users",
    color: "cobalt",
  },
  {
    title: "Payments",
    description: "Monitor revenues, view settlements, or log refund requests.",
    href: "/admin/payments",
    icon: "CreditCard",
    color: "moss",
  },
  {
    title: "Certificates",
    description: "Upload layout templates and generate participant awards.",
    href: "/admin/certificates",
    icon: "Award",
    color: "orange",
  },
  {
    title: "Analytics",
    description: "Inspect conversion rates, categories, and traffic trends.",
    href: "/admin/analytics",
    icon: "BarChart3",
    color: "coral",
  },
];
