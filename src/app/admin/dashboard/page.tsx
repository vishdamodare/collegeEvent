import { redirect } from "next/navigation";

// Old duplicate dashboard; Home lives at /admin
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
