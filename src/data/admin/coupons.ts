import { CouponType } from "@/types/admin/coupon";

export const MOCK_COUPONS: CouponType[] = [
  {
    id: "cpn-early50",
    code: "EARLY50",
    description: "50% off for first 50 signups",
    discountType: "PERCENT",
    discountValue: 50,
    maxDiscount: 150,
    status: "ACTIVE"
  },
  {
    id: "cpn-freefest",
    code: "FREEFEST",
    description: "100% off coupon code",
    discountType: "PERCENT",
    discountValue: 100,
    status: "ACTIVE"
  }
];

export function getCoupons() {
  return MOCK_COUPONS;
}

export function validateCoupon(code: string, ticketPrice: number): { valid: boolean; discountAmount: number; error?: string } {
  const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase() && c.status === "ACTIVE");
  if (!coupon) {
    return { valid: false, discountAmount: 0, error: "Invalid or inactive coupon code" };
  }
  let discountAmount = 0;
  if (coupon.discountType === "PERCENT") {
    discountAmount = (ticketPrice * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }
  return { valid: true, discountAmount };
}
