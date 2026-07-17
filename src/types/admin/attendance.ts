export type TicketStatus = "UNUSED" | "USED" | "CANCELLED" | "EXPIRED";

export interface AttendanceRecord {
  id: string;
  ticketId: string;
  registrationId: string;
  participantId: string;
  eventId: string;
  ticketType: string;
  verificationToken: string;
  status: TicketStatus;
  checkedIn: boolean;
  checkedInAt?: string;
}
