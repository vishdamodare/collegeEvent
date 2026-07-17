import { AnalyticsSummary } from "@/types/admin";

export const MOCK_ANALYTICS: AnalyticsSummary = {
  overallConversionRate: 15.4,
  returningUsersPercentage: 32.5,
  averageAttendanceRate: 88.0,
  dailyRegistrations: [
    { label: "July 8", value: 12 },
    { label: "July 9", value: 19 },
    { label: "July 10", value: 15 },
    { label: "July 11", value: 28 },
    { label: "July 12", value: 32 },
    { label: "July 13", value: 24 },
    { label: "July 14", value: 38 },
  ],
  monthlyRegistrations: [
    { label: "Jan", value: 92 },
    { label: "Feb", value: 120 },
    { label: "Mar", value: 185 },
    { label: "Apr", value: 240 },
    { label: "May", value: 190 },
    { label: "Jun", value: 215 },
    { label: "Jul", value: 310 },
  ],
  categoryRegistrations: [
    { category: "Technical", count: 280, percentage: 56, color: "var(--color-lime)" },
    { category: "Cultural", count: 140, percentage: 28, color: "var(--color-cobalt)" },
    { category: "Sports", count: 80, percentage: 16, color: "var(--color-coral)" },
  ],
  popularEvents: [
    {
      id: "evt-hackathon-2026",
      title: "National Coding Hackathon 2026",
      registrations: 142,
      revenue: 42458,
      conversionRate: 18.2,
    },
    {
      id: "evt-robotics-2026",
      title: "Robotics Arena & RC Challenge",
      registrations: 38,
      revenue: 18962,
      conversionRate: 12.4,
    },
    {
      id: "evt-ai-symposium",
      title: "Generative AI & LLM Conference",
      registrations: 124,
      revenue: 0,
      conversionRate: 22.8,
    },
  ],
  citiesBreakdown: [
    { city: "Mumbai", registrations: 290, percentage: 58 },
    { city: "Pune", registrations: 120, percentage: 24 },
    { city: "Nagpur", registrations: 50, percentage: 10 },
    { city: "Nashik", registrations: 40, percentage: 8 },
  ],
  collegesBreakdown: [
    { college: "Vidyalankar Institute of Technology", registrations: 190 },
    { college: "Veermata Jijabai Technological Institute (VJTI)", registrations: 110 },
    { college: "K.J. Somaiya College of Engineering", registrations: 85 },
    { college: "D.Y. Patil College of Engineering", registrations: 65 },
    { college: "Thadomal Shahani Engineering College", registrations: 50 },
  ],
  deviceBreakdown: [
    { device: "Mobile", percentage: 55 },
    { device: "Desktop", percentage: 38 },
    { device: "Tablet", percentage: 7 },
  ],
  conversionFunnel: [
    { step: "Visits", count: 1200, percentage: 100 },
    { step: "Event Views", count: 850, percentage: 70.8 },
    { step: "Initiated Registration", count: 420, percentage: 35 },
    { step: "Completed Form", count: 280, percentage: 23.3 },
    { step: "Success / Paid", count: 185, percentage: 15.4 },
  ],
};
