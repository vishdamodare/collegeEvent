import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colleges — CollegeEvents",
  description: "Browse colleges hosting events on CollegeEvents.",
  alternates: { canonical: "/colleges" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
