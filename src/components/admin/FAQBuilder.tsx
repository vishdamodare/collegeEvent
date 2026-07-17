"use client";

import { useState } from "react";
import { Plus, Trash2, Check, HelpCircle } from "lucide-react";

interface FAQBuilderProps {
  faqs: { question: string; answer: string }[];
  onChange: (faqs: { question: string; answer: string }[]) => void;
}

export function FAQBuilder({ faqs, onChange }: FAQBuilderProps) {
  const addFaq = () => {
    onChange([...faqs, { question: "New Question?", answer: "New Answer" }]);
  };

  const removeFaq = (idx: number) => {
    onChange(faqs.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, question: string, answer: string) => {
    onChange(
      faqs.map((f, i) => {
        if (i === idx) {
          return { question, answer };
        }
        return f;
      })
    );
  };

  return (
    <div className="space-y-5 font-archivo">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h4>
          <p className="text-[12px] text-white/40">Resolve common student queries about schedules, laptops, prerequisites, and certificates.</p>
        </div>
        <button
          type="button"
          onClick={addFaq}
          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11.5px] font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#141414]/40 border border-white/5 space-y-3 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-white/30 uppercase mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(idx, e.target.value, faq.answer)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  placeholder="e.g. Is there a registration fee?"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFaq(idx)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 mt-5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase mb-1">Answer</label>
              <textarea
                rows={3}
                value={faq.answer}
                onChange={(e) => updateFaq(idx, faq.question, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                placeholder="Provide detailed answer here..."
              ></textarea>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
