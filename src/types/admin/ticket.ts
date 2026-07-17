export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  saleStart?: string;
  saleEnd?: string;
  perUserLimit?: number;
  visibility?: "PUBLIC" | "PRIVATE" | "HIDDEN";
  color?: string;
  benefits?: string[];
  ticketImageUrl?: string;
}
