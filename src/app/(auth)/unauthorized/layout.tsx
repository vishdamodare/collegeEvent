import type { Metadata } from "next";

export const metadata: Metadata = { title: "Access denied — CollegeEvents", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
