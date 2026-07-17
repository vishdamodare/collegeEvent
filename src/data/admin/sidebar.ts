export interface SidebarItem {
  title: string;
  href: string;
  icon: string; // Lucide icon identifier
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: "CalendarRange",
  },
  {
    title: "Participants",
    href: "/admin/participants",
    icon: "Users",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: "CreditCard",
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: "Award",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "BarChart3",
  },
  {
    title: "College Profile",
    href: "/admin/college",
    icon: "School",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: "Bell",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
  {
    title: "QR Scanner",
    href: "/admin/check-in",
    icon: "QrCode",
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: "HelpCircle",
  },
];
