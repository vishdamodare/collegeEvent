import { getAdminDashboardStats } from "@/actions/admin";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardStats();

  return <AdminDashboardClient initialData={data} />;
}
