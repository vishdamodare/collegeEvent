import { TicketType } from "@/types/admin/ticket";

export const MOCK_TICKETS: TicketType[] = [
  {
    id: "tkt-early",
    name: "Early Bird Pass",
    description: "Discounted access for early registrants",
    price: 199,
    quantity: 50,
    perUserLimit: 1,
    visibility: "PUBLIC",
    color: "#D7FF3D",
    benefits: ["Full Access", "Digital Kit", "Participation Certificate"]
  },
  {
    id: "tkt-reg",
    name: "Regular Pass",
    description: "Standard access ticket",
    price: 299,
    quantity: 150,
    perUserLimit: 2,
    visibility: "PUBLIC",
    color: "#2451FF",
    benefits: ["Full Access", "Participation Certificate"]
  }
];

export function getTickets() {
  return MOCK_TICKETS;
}

export function createTicket(ticket: Omit<TicketType, "id">): TicketType {
  const newTicket = { ...ticket, id: `tkt-${Math.random().toString(36).substr(2, 9)}` };
  MOCK_TICKETS.push(newTicket);
  return newTicket;
}
