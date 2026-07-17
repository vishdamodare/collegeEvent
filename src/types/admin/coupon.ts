export interface CouponType {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscount?: number;
  expiry?: string;
  maxUses?: number;
  perUserLimit?: number;
  applicableTickets?: string[]; // ticketIds
  minPurchase?: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
}
