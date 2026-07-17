import { AttendanceRecord } from "@/types/admin/attendance";

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    ticketId: "tkt-rec-1",
    registrationId: "reg-rec-1",
    participantId: "part-rec-1",
    eventId: "evt-hackathon-2026",
    ticketType: "Early Bird Pass",
    verificationToken: "token-abc-123",
    status: "UNUSED",
    checkedIn: false
  }
];

export function getAttendanceByEvent(eventId: string) {
  return MOCK_ATTENDANCE.filter(a => a.eventId === eventId);
}

export function verifyTicketQR(token: string): { success: boolean; record?: AttendanceRecord; error?: string } {
  const record = MOCK_ATTENDANCE.find(r => r.verificationToken === token);
  if (!record) {
    return { success: false, error: "Invalid Ticket Pass or QR signature" };
  }
  if (record.status === "CANCELLED" || record.status === "EXPIRED") {
    return { success: false, error: `Ticket status is ${record.status}` };
  }
  if (record.checkedIn) {
    return { success: false, record, error: "Duplicate Entry! Ticket already scanned." };
  }
  
  // Mark checked in
  record.checkedIn = true;
  record.status = "USED";
  record.checkedInAt = new Date().toISOString();
  return { success: true, record };
}
