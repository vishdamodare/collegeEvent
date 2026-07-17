"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Event } from "@/types";
import { cn } from "@/utils/cn";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function RegistrationModal({ isOpen, onClose, event }: RegistrationModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSuccess(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!event) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[2000] bg-[#0A0A0A]/95 backdrop-blur-[12px] transition-all duration-500 ease-[var(--ease-custom)] overflow-y-auto",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    >
      <div className="min-h-full flex items-center justify-center py-[60px] px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div 
          className={cn(
            "w-full max-w-[700px] relative transition-transform duration-500 ease-[var(--ease-custom)]",
            isOpen ? "translate-y-0" : "translate-y-[40px]"
          )}
        >
          {/* Close button outside standard flow, fixed to top right of modal area */}
          <button 
            className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-[10px] z-10 text-[18px] flex items-center justify-center transition-all hover:bg-white hover:text-black hover:scale-110"
            onClick={onClose}
          >
            ✕
          </button>

          {!isSuccess ? (
            <div id="regForm">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-bold tracking-widest uppercase text-white/80 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_8px_var(--color-lime)]"></div>
                  Almost there
                </div>
                
                <h2 className="text-[clamp(40px,5vw,64px)] font-anton leading-[1] uppercase tracking-tight mb-4">
                  Register for the event
                </h2>
                
                <p className="text-[17px] text-[var(--color-text-muted)] leading-[1.6]">
                  Fill in your details below — a confirmation with your entry pass will land in your inbox.
                </p>
              </div>

              {/* Event Summary Card */}
              <div className="flex items-center gap-[18px] p-[20px] rounded-[20px] bg-[var(--color-card)] border border-[var(--color-border)] mb-10">
                <div className="w-[64px] h-[64px] rounded-[14px] overflow-hidden bg-white/5 relative flex-none border border-[var(--color-border)]">
                  <Image src={event.img} alt={event.title} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold font-archivo mb-1">{event.title}</h4>
                  <div className="text-[14px] text-[var(--color-text-faint)]">
                    {event.college} · {event.date} · {event.venue}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[14px] font-semibold mb-2.5 text-white">Full name</label>
                  <input type="text" placeholder="e.g. Aarav Mehta" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] font-inherit outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold mb-2.5 text-white">Email</label>
                  <input type="email" placeholder="you@college.edu" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] font-inherit outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold mb-2.5 text-white">Phone number</label>
                  <input type="text" placeholder="+91 98765 43210" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] font-inherit outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold mb-2.5 text-white">College</label>
                  <input type="text" placeholder="Your institution" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] font-inherit outline-none transition-colors focus:border-[var(--color-lime)] placeholder:text-[#555]" />
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-[14px] font-semibold mb-2.5 text-white">Team size</label>
                <div className="relative">
                  <select className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[15px] font-inherit outline-none transition-colors focus:border-[var(--color-lime)] appearance-none cursor-pointer">
                    <option>Just me (solo)</option>
                    <option>Team of 2</option>
                    <option>Team of 3</option>
                    <option>Team of 4+</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary w-full py-[18px] text-[16px] shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]"
                onClick={() => setIsSuccess(true)}
              >
                Confirm registration
              </button>
            </div>
          ) : (
            <div id="regSuccess" className="px-[48px] py-[80px] text-center bg-[#0F0F0B] border border-[var(--color-border)] rounded-[32px]">
              <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-lime)] flex items-center justify-center text-[36px] mx-auto mb-6 text-[#0B0B08]">
                ✓
              </div>
              <h2 className="text-[42px] font-anton mb-3 uppercase tracking-tight">You're in!</h2>
              <p className="text-[17px] text-[var(--color-text-muted)] mb-8">
                Your ticket for <b>{event.title}</b> has been sent to your email. See you on campus!
              </p>
              <button className="btn btn-glass px-8" onClick={onClose}>
                Back to explore
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
