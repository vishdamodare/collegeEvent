"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Inbox,
  Loader2,
  DollarSign
} from "lucide-react";
import { getAdminPayments } from "@/actions/admin";

export default function PaymentsPage() {
  const [data, setData] = useState<any>({
    revenue: 0,
    settled: 0,
    pending: 0,
    refunds: 0,
    transactions: []
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await getAdminPayments();
      setData(res);
    });
  }, []);

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Payments & Settlements</h1>
        <p className="text-[13px] text-white/40">Inspect event registration revenue, track bank fests fess, and coordinate student refund claims.</p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total revenue */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-[var(--color-lime)]" />
          </div>
          <span className="text-[28px] font-anton text-white">₹{data.revenue.toLocaleString()}</span>
          <p className="text-[10px] text-white/30 block mt-1">Total revenue generated</p>
        </div>

        {/* Settled revenue */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled Amount</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-[28px] font-anton text-white">₹{data.settled.toLocaleString()}</span>
          <p className="text-[10px] text-white/30 block mt-1">Transferred to college bank account</p>
        </div>

        {/* Pending settlement */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Settlement</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-[28px] font-anton text-white">₹{data.pending.toLocaleString()}</span>
          <p className="text-[10px] text-white/30 block mt-1">Processing in escrow</p>
        </div>

        {/* Platform Fees */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Charge</span>
            <CreditCard className="w-4 h-4 text-[var(--color-cobalt)]" />
          </div>
          <span className="text-[28px] font-anton text-white">₹0</span>
          <p className="text-[10px] text-white/30 block mt-1">CollegeEvents commission</p>
        </div>
      </div>

      {/* Bank Settlement Information Banner */}
      <div className="rounded-2xl border border-[var(--color-lime)]/20 bg-[var(--color-lime)]/5 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--color-lime)] mt-0.5" />
          <div>
            <h4 className="text-[14px] font-bold text-white leading-tight">SaaS Payment Payout Settled</h4>
            <p className="text-[12px] text-white/60 mt-1">College accounts are linked to payouts. Free fests are processed instantly with ₹0 transaction logs.</p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 backdrop-blur-xl">
        <h3 className="text-[16px] font-bold uppercase tracking-wider text-white mb-4">Transaction logs</h3>
        
        {isPending ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-lime)]" />
          </div>
        ) : data.transactions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-white/30 space-y-3">
            <Inbox className="w-8 h-8 text-white/20" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">No transactions yet</p>
              <p className="text-xs text-white/20 mt-0.5">All active events are currently free. No payment records available.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Future Transactions mapping */}
          </div>
        )}
      </div>
    </div>
  );
}
