import { getAdminAttendanceAction } from "@/actions/admin";
import { AttendanceClient } from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const data = await getAdminAttendanceAction();

  return <AttendanceClient initialData={data} />;
}
