export interface TransactionLog {
  id: string;
  transactionId: string;
  eventName: string;
  participantName: string;
  email: string;
  amount: number;
  platformFee: number;
  gst: number;
  netAmount: number;
  couponCode?: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  paymentMethod: string;
  date: string;
}

export interface RefundLog {
  id: string;
  transactionId: string;
  eventName: string;
  participantName: string;
  amount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestDate: string;
  processedDate?: string;
}

export interface CouponUsage {
  code: string;
  discount: string;
  usedCount: number;
  totalSavings: number;
}

export interface PaymentsSummary {
  totalRevenue: number;
  todayRevenue: number;
  pendingRevenue: number;
  completedRevenue: number;
  refundRequestsCount: number;
  platformFeeTotal: number;
  couponSavingsTotal: number;
  settlementStatus: "SETTLED" | "PENDING" | "PROCESSING";
  lastSettlementDate?: string;
}

export interface PaymentSettings {
  paymentProvider?: "RAZORPAY" | "STRIPE" | "CASHFREE";
  providerOrderId?: string;
  transactionId?: string;
  refundStatus?: "PENDING" | "PROCESSED" | "FAILED";
  settlementStatus?: "PENDING" | "SETTLED";
}
