import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pending approval — CollegeEvents", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
