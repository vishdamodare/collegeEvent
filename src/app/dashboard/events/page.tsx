import { getStudentRegistrations } from "@/actions/registrations";
import { MyEventsClient } from "@/components/dashboard/MyEventsClient";

export default async function MyEventsPage() {
  const registrationsData = await getStudentRegistrations();
  const registrations = "all" in registrationsData ? registrationsData.all : registrationsData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)] text-text-main">
          My Events
        </h1>
        <p className="text-text-faint mt-1">Manage events you have registered for, view digital tickets, and add to calendar.</p>
      </div>

      <MyEventsClient registrations={registrations} />
    </div>
  );
}
