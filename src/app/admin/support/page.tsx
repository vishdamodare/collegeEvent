"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  ChevronDown, 
  Send,
  LifeBuoy
} from "lucide-react";

export default function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;

    alert(`Ticket successfully raised! Subject: "${ticketSubject}". Priority: ${ticketPriority}. Our helpdesk will email you shortly.`);
    setTicketSubject("");
    setTicketDescription("");
  };

  const FAQS = [
    {
      q: "How does ticket revenue get transferred to our college bank account?",
      a: "All ticket purchases are held in a secure platform escrow. Settlements are initiated every Friday automatically. Payout checks take 2-3 business days to clear directly into your verified bank account.",
    },
    {
      q: "Can I customize the variables on the participation certificates?",
      a: "Yes! Upload your template layout in the Certificates tab. The platform will overlay user parameters (FullName, RollNumber, CollegeName) onto your design PDF automatically.",
    },
    {
      q: "How do we verify student ticket scans at the event entrance?",
      a: "In the Admin Top Navigation or student ticket cards, a QR scanner hook is provided. You can run it on any smartphone browser to check-in attendees and update attendance databases live.",
    },
  ];

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Organizer Support</h1>
        <p className="text-[13px] text-white/40">Access guides, check FAQs, and request technical support from the platform team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. FAQs & Documentation Guides */}
        <div className="lg:col-span-2 space-y-6">
          {/* Docs link list */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-lime)]" /> Quick Reference Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a href="#" className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col justify-between min-h-[100px]">
                <span className="text-[13px] font-bold text-white">Event Wizard Guide</span>
                <span className="text-[11px] text-white/40 mt-1">Schedules, team settings, and visibility checks.</span>
              </a>
              <a href="#" className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col justify-between min-h-[100px]">
                <span className="text-[13px] font-bold text-white">Ticketing & Escrow FAQ</span>
                <span className="text-[11px] text-white/40 mt-1">Platform commissions, GST parameters, and timelines.</span>
              </a>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-lime)]" /> Frequently Asked Questions
            </h3>
            <div className="space-y-3 pt-2">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 flex justify-between items-center text-left text-white hover:text-[var(--color-lime)] transition-colors cursor-pointer"
                  >
                    <span className="text-[13px] font-bold">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeFaq === idx ? "rotate-185 text-[var(--color-lime)]" : "text-white/45"}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-4 text-[12px] text-white/60 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Raise Ticket form */}
        <div>
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-6">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--color-lime)]" /> Raise Support Ticket
            </h3>

            <form onSubmit={handleRaiseTicket} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-white/50">Ticket Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Settlement Delay SBI"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[12.5px] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-white/50">Details / Description</label>
                <textarea 
                  rows={4}
                  placeholder="Explain your problem in detail."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[12.5px] outline-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-white/50">Priority Level</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white/70 text-[12.5px] outline-none cursor-pointer"
                >
                  <option value="LOW">Low (General Query)</option>
                  <option value="MEDIUM">Medium (Setup Help)</option>
                  <option value="HIGH">High (Payment / Settlement)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[12.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" /> Raise Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
