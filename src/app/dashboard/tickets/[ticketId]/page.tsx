import { notFound, redirect } from "next/navigation";
import { getTicket } from "@/actions/registrations";
import { getEventsByOrganizer } from "@/actions/events";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TicketDetailClient } from "@/components/dashboard/TicketDetailClient";

interface TicketPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { ticketId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }

  // Fetch other fests by same organizer
  const moreEvents = await getEventsByOrganizer(ticket.event.organizerId, ticket.event.id);

  return (
    <div className="space-y-6">
      <TicketDetailClient ticket={ticket} moreEvents={moreEvents} />
    </div>
  );
}
