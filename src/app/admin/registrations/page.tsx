import { getAdminRegistrationsAction } from "@/actions/admin";
import { RegistrationsClient } from "./RegistrationsClient";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const data = await getAdminRegistrationsAction();

  return <RegistrationsClient initialData={data} />;
}
