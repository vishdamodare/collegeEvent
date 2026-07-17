"use client";

import { useState } from "react";
import { TicketType } from "@/types/admin/ticket";
import { Plus, Trash2, Settings, DollarSign, Calendar, Eye, ShieldAlert, PlusCircle } from "lucide-react";

interface TicketBuilderProps {
  tickets: TicketType[];
  onChange: (tickets: TicketType[]) => void;
}

const TICKET_COLORS = [
  { name: "Lime Accent", hex: "#D7FF3D" },
  { name: "Cobalt Blue", hex: "#2451FF" },
  { name: "Coral Red", hex: "#FF4B33" },
  { name: "Orange Splash", hex: "#F97316" },
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Royal Purple", hex: "#8B5CF6" }
];

export function TicketBuilder({ tickets, onChange }: TicketBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTicketTier = () => {
    const newTier: TicketType = {
      id: `tkt-${Math.random().toString(36).substr(2, 9)}`,
      name: "New Ticket Pass",
      description: "Access pass details",
      price: 0,
      quantity: 100,
      perUserLimit: 1,
      visibility: "PUBLIC",
      color: "#2451FF",
      benefits: ["Event entry"]
    };
    onChange([...tickets, newTier]);
    setEditingId(newTier.id);
  };

  const removeTicketTier = (id: string) => {
    onChange(tickets.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateTicketTier = (id: string, updates: Partial<TicketType>) => {
    onChange(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addBenefit = (ticketId: string, benefits: string[]) => {
    updateTicketTier(ticketId, { benefits: [...benefits, "New Benefit"] });
  };

  const updateBenefit = (ticketId: string, benefits: string[], idx: number, val: string) => {
    const next = [...benefits];
    next[idx] = val;
    updateTicketTier(ticketId, { benefits: next });
  };

  const removeBenefit = (ticketId: string, benefits: string[], idx: number) => {
    updateTicketTier(ticketId, { benefits: benefits.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-white uppercase tracking-wider">Ticket Categories</h4>
          <p className="text-[12px] text-white/40">Configure multiple pricing brackets, VIP access passes, or group pricing tiers.</p>
        </div>
        <button
          type="button"
          onClick={addTicketTier}
          className="px-4 py-2 rounded-xl bg-[var(--color-lime)] text-[#0B0B08] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-[var(--color-lime)]/90"
        >
          <Plus className="w-4 h-4" /> Add Ticket Tier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 font-archivo">
        {tickets.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-xl border transition-all ${
                isEditing ? "border-[var(--color-lime)] bg-white/5" : "border-white/5 bg-[#141414]/40"
              } p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-4 h-12 rounded"
                    style={{ backgroundColor: t.color || "#2451FF" }}
                  />
                  <div>
                    <h5 className="text-[14.5px] font-bold text-white leading-tight">{t.name}</h5>
                    <p className="text-[11.5px] text-white/40 mt-1">{t.description || "No description provided"}</p>
                    <div className="flex items-center gap-3.5 mt-2">
                      <span className="text-[12px] font-bold text-[var(--color-lime)]">
                        {t.price === 0 ? "FREE" : `₹${t.price}`}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[11px] text-white/50">{t.quantity} tickets available</span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] uppercase font-bold text-white/40 px-2 py-0.5 rounded bg-white/5">
                        {t.visibility || "PUBLIC"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : t.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTicketTier(t.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-5 pt-5 border-t border-white/5 space-y-4 font-archivo">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Ticket Name</label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => updateTicketTier(t.id, { name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Ticket Price (INR)</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) => updateTicketTier(t.id, { price: Number(e.target.value) })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Available Quantity</label>
                      <input
                        type="number"
                        value={t.quantity}
                        onChange={(e) => updateTicketTier(t.id, { quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Ticket Description</label>
                      <input
                        type="text"
                        value={t.description || ""}
                        onChange={(e) => updateTicketTier(t.id, { description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="e.g. Includes conference entry and lunch kit"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Per-User Limit</label>
                      <input
                        type="number"
                        value={t.perUserLimit || 1}
                        onChange={(e) => updateTicketTier(t.id, { perUserLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Visibility Mode</label>
                      <select
                        value={t.visibility || "PUBLIC"}
                        onChange={(e) => updateTicketTier(t.id, { visibility: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none cursor-pointer"
                      >
                        <option value="PUBLIC">Publicly Visible</option>
                        <option value="PRIVATE">Invite/Code Required</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </div>
                  </div>

                  {/* Badge Color Selector & Benefits Editor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-2">Ticket Badge Theme Color</label>
                      <div className="flex flex-wrap gap-2">
                        {TICKET_COLORS.map((col, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => updateTicketTier(t.id, { color: col.hex })}
                            className={`w-7 h-7 rounded-full border transition-all ${
                              t.color === col.hex ? "border-white scale-110" : "border-white/10 hover:scale-105"
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-white/40 uppercase">Ticket Benefits</label>
                        <button
                          type="button"
                          onClick={() => addBenefit(t.id, t.benefits || [])}
                          className="text-[11px] font-bold text-[var(--color-lime)] flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Add Benefit
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(t.benefits || []).map((ben, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ben}
                              onChange={(e) => updateBenefit(t.id, t.benefits || [], bIdx, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded bg-[#181818] border border-white/5 text-white text-[12.5px] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeBenefit(t.id, t.benefits || [], bIdx)}
                              className="p-1.5 text-white/30 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-lg bg-[var(--color-lime)] text-[#0B0B08] font-bold text-[12px] cursor-pointer"
                    >
                      Done Editing
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
