export interface Participant {
  id: string;
  name: string;
  registrationId: string;
  ticketNumber: string;
  college: string;
  department: string;
  email: string;
  phone: string;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED" | "FREE";
  attendance: boolean;
  certificateStatus: "GENERATED" | "PENDING" | "SENT" | "NONE";
  registrationDate: string;
  teamName?: string;
  teamMembers: string[];
}
