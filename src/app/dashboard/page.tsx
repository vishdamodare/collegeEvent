import { getStudentDashboard } from "@/actions/profile";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const data = await getStudentDashboard();

  const fallbackData = {
    user: { id: "", name: "Student", email: "" },
    profile: null,
    savedCount: 0,
    upcomingEvents: [],
  };

  return <DashboardOverview data={data || fallbackData} />;
}
