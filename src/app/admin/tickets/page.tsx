import { getAdminTicketsAction } from "@/actions/admin";
import { TicketsClient } from "./TicketsClient";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const data = await getAdminTicketsAction();

  return <TicketsClient initialData={data} />;
}
