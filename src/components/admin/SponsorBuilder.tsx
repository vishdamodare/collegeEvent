"use client";

import { useState } from "react";
import { SponsorType } from "@/types/admin/sponsor";
import { Plus, Trash2, Settings, Globe, Award, List } from "lucide-react";

interface SponsorBuilderProps {
  sponsors: SponsorType[];
  onChange: (sponsors: SponsorType[]) => void;
}

const CATEGORIES = [
  { value: "TITLE", label: "Title Sponsor" },
  { value: "GOLD", label: "Gold Sponsor" },
  { value: "SILVER", label: "Silver Sponsor" },
  { value: "BRONZE", label: "Bronze Sponsor" },
  { value: "PARTNER", label: "Partner" },
  { value: "MEDIA", label: "Media Partner" }
];

export function SponsorBuilder({ sponsors, onChange }: SponsorBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addSponsor = () => {
    const newSponsor: SponsorType = {
      id: `sp-${Math.random().toString(36).substr(2, 9)}`,
      name: "New Sponsor",
      category: "GOLD",
      logoUrl: "",
      websiteUrl: "",
      description: "Event Sponsor details",
      priority: sponsors.length + 1,
      visibility: true
    };
    onChange([...sponsors, newSponsor]);
    setEditingId(newSponsor.id);
  };

  const removeSponsor = (id: string) => {
    onChange(sponsors.filter(s => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateSponsor = (id: string, updates: Partial<SponsorType>) => {
    onChange(sponsors.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-6 font-archivo">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-white uppercase tracking-wider">Sponsor Directory</h4>
          <p className="text-[12px] text-white/40">Feature brand partners, food stalls, tech associations, and title sponsors on your portal.</p>
        </div>
        <button
          type="button"
          onClick={addSponsor}
          className="px-4 py-2 rounded-xl bg-[var(--color-lime)] text-[#0B0B08] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-[var(--color-lime)]/90"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sponsors.map((s) => {
          const isEditing = editingId === s.id;
          const catLabel = CATEGORIES.find(c => c.value === s.category)?.label || s.category;

          return (
            <div
              key={s.id}
              className={`rounded-xl border transition-all ${
                isEditing ? "border-[var(--color-lime)] bg-white/5" : "border-white/5 bg-[#141414]/40"
              } p-4`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60 font-bold uppercase border border-white/5">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      s.name.slice(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-[13.5px] font-bold text-white">{s.name}</h5>
                      <span className="text-[10px] uppercase font-bold text-[var(--color-lime)] bg-[var(--color-lime)]/10 px-2 py-0.5 rounded border border-[var(--color-lime)]/20">
                        {catLabel}
                      </span>
                    </div>
                    {s.websiteUrl && (
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 flex items-center gap-1 hover:underline mt-1"
                      >
                        <Globe className="w-3 h-3" /> {s.websiteUrl}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : s.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSponsor(s.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Sponsor Name</label>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSponsor(s.id, { name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Category Tier</label>
                      <select
                        value={s.category}
                        onChange={(e) => updateSponsor(s.id, { category: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none cursor-pointer"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Logo URL</label>
                      <input
                        type="text"
                        value={s.logoUrl || ""}
                        onChange={(e) => updateSponsor(s.id, { logoUrl: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Website Link</label>
                      <input
                        type="text"
                        value={s.websiteUrl || ""}
                        onChange={(e) => updateSponsor(s.id, { websiteUrl: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="https://google.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Brief Description</label>
                      <input
                        type="text"
                        value={s.description || ""}
                        onChange={(e) => updateSponsor(s.id, { description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="Brief summary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Display Priority Index</label>
                      <input
                        type="number"
                        value={s.priority}
                        onChange={(e) => updateSponsor(s.id, { priority: Number(e.target.value) })}
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
                      Done
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
