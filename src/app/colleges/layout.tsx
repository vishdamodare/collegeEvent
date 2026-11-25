import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colleges Hosting Fests & Events — IIT Bombay, Atharva & More | CollegeEvents",
  description: "Browse colleges hosting fests, hackathons and competitions on CollegeEvents. See each campus, its upcoming events, and register free.",
  alternates: { canonical: "/colleges" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
