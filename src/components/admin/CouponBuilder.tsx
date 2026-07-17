"use client";

import { useState } from "react";
import { CouponType } from "@/types/admin/coupon";
import { Plus, Trash2, Edit2, Check, Settings2, Percent, Tag } from "lucide-react";

interface CouponBuilderProps {
  coupons: CouponType[];
  onChange: (coupons: CouponType[]) => void;
}

export function CouponBuilder({ coupons, onChange }: CouponBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCoupon = () => {
    const newCoupon: CouponType = {
      id: `cpn-${Math.random().toString(36).substr(2, 9)}`,
      code: "NEWCOUPON",
      description: "Custom discount coupon",
      discountType: "PERCENT",
      discountValue: 10,
      status: "ACTIVE"
    };
    onChange([...coupons, newCoupon]);
    setEditingId(newCoupon.id);
  };

  const removeCoupon = (id: string) => {
    onChange(coupons.filter(c => c.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateCoupon = (id: string, updates: Partial<CouponType>) => {
    onChange(coupons.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-white uppercase tracking-wider">Coupons & Discount Codes</h4>
          <p className="text-[12px] text-white/40">Manage marketing campaigns, student organization discounts, or special early bird promo codes.</p>
        </div>
        <button
          type="button"
          onClick={addCoupon}
          className="px-4 py-2 rounded-xl bg-[var(--color-lime)] text-[#0B0B08] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-[var(--color-lime)]/90"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 font-archivo">
        {coupons.map((c) => {
          const isEditing = editingId === c.id;
          return (
            <div
              key={c.id}
              className={`rounded-xl border transition-all ${
                isEditing ? "border-[var(--color-lime)] bg-white/5" : "border-white/5 bg-[#141414]/40"
              } p-4`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 text-[var(--color-lime)]">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-[14px] font-extrabold text-white tracking-wider uppercase">{c.code}</h5>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                        c.status === "ACTIVE" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-white/5 text-white/40 border border-white/5"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-white/40 mt-1">{c.description || "No description"}</p>
                    <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-white/50">
                      <span className="font-bold text-[var(--color-lime)]">
                        {c.discountType === "PERCENT" ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                      </span>
                      {c.maxDiscount && (
                        <>
                          <span className="text-white/20">•</span>
                          <span>Max Discount ₹{c.maxDiscount}</span>
                        </>
                      )}
                      {c.expiry && (
                        <>
                          <span className="text-white/20">•</span>
                          <span>Expires {new Date(c.expiry).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCoupon(c.id, { status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/50 hover:text-white text-[11px] font-bold cursor-pointer"
                  >
                    Toggle Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : c.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCoupon(c.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 font-archivo">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        value={c.code}
                        onChange={(e) => updateCoupon(c.id, { code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none tracking-widest font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Discount Type</label>
                      <select
                        value={c.discountType}
                        onChange={(e) => updateCoupon(c.id, { discountType: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none cursor-pointer"
                      >
                        <option value="PERCENT">Percentage Discount (%)</option>
                        <option value="FIXED">Flat Discount Amount (INR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Discount Value</label>
                      <input
                        type="number"
                        value={c.discountValue}
                        onChange={(e) => updateCoupon(c.id, { discountValue: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Description</label>
                      <input
                        type="text"
                        value={c.description || ""}
                        onChange={(e) => updateCoupon(c.id, { description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="e.g. 50% discount for early registrations"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Max Discount Amount (INR)</label>
                      <input
                        type="number"
                        value={c.maxDiscount || ""}
                        onChange={(e) => updateCoupon(c.id, { maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Expiry Date</label>
                      <input
                        type="date"
                        value={c.expiry || ""}
                        onChange={(e) => updateCoupon(c.id, { expiry: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg bg-[var(--color-lime)] text-[#0B0B08] font-bold text-[12px] cursor-pointer"
                    >
                      Done Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
