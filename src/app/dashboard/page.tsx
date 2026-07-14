import { getStudentDashboard } from "@/actions/profile";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const data = await getStudentDashboard();

  if (!data) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardOverview data={data} />;
}
