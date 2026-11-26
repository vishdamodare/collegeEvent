import type { Metadata } from "next";

export const metadata: Metadata = { title: "Organizer sign in — CollegeEvent", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
