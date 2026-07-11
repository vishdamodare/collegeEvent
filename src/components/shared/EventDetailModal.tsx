"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Event, CollegeInfo } from "@/types";
import { cn } from "@/utils/cn";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  collegeInfo?: CollegeInfo;
  onRegister: () => void;
}

export function EventDetailModal({ isOpen, onClose, event, collegeInfo, onRegister }: EventDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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
        "fixed inset-0 z-[2000] bg-[#0A0A0A] overflow-y-auto transition-all duration-500 ease-[var(--ease-custom)]",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    >
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-10 py-6 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-medium hover:bg-white/10 transition-colors"
        >
          ← Back
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-medium hover:bg-white/10 transition-colors">
          Share
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[80px]">
          
          {/* LEFT COLUMN: Main Content */}
          <div>
            {/* Header Area */}
            <div className="mb-10">
              <span className={`cat-badge ${event.badge} mb-3 inline-block`}>{event.cat}</span>
              <h1 className="text-[clamp(48px,6vw,84px)] font-anton leading-[0.95] tracking-tight uppercase mb-6">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-[10px] mb-12">
                <span className="meta-chip text-[12px] py-1.5 px-3">🏫 <b>{event.college}</b></span>
                <span className="meta-chip text-[12px] py-1.5 px-3">📅 <b>{event.date}</b></span>
                <span className="meta-chip text-[12px] py-1.5 px-3">📍 <b>{event.venue}</b></span>
                <span className="meta-chip text-[12px] py-1.5 px-3">👥 <b>{event.participants}</b></span>
              </div>

              <p className="text-[17px] text-[var(--color-text-muted)] leading-[1.7] max-w-[700px]">
                {event.sub}
              </p>
            </div>

            {/* About the Host College */}
            {collegeInfo && (
              <div className="mb-16">
                <h3 className="font-anton text-[24px] tracking-wide uppercase mb-6">About the Host College</h3>
                
                <div className="p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] mb-6">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden bg-white/5 flex-none relative">
                      <Image src={collegeInfo.img} alt={event.college} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-[19px] font-bold font-archivo">{event.college}</h4>
                      <div className="text-[13px] text-[var(--color-text-faint)] flex items-center gap-1.5 mt-1">
                        📍 {collegeInfo.loc} · Est. {collegeInfo.founded}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[14px] text-[var(--color-text-muted)] leading-[1.6] mb-5">
                    {collegeInfo.about}
                  </p>
                  
                  <div className="flex gap-6 text-[13px]">
                    <div><b className="text-[var(--color-lime)]">{collegeInfo.students}</b> students</div>
                    <div><b className="text-[var(--color-lime)]">{collegeInfo.events}</b> events hosted</div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-3 gap-4">
                  {collegeInfo.gallery.map((img, i) => (
                    <div key={i} className="h-[140px] rounded-[16px] overflow-hidden relative border border-[var(--color-border)]">
                      <Image src={img} alt="Gallery" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {collegeInfo && collegeInfo.past.length > 0 && (
              <div className="mb-16">
                <h3 className="font-anton text-[24px] tracking-wide uppercase mb-6">Past Events at this College</h3>
                <div className="flex flex-col gap-4">
                  {collegeInfo.past.map((past, i) => (
                    <div key={i} className="p-5 rounded-[20px] bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-[22px]">
                          {past.icon}
                        </div>
                        <div>
                          <div className="font-bold font-archivo text-[15px] mb-0.5">{past.name}</div>
                          <div className="text-[12px] text-[var(--color-text-faint)]">{past.type}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-bold text-[var(--color-lime)] tracking-wider">
                        COMPLETED
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Timeline */}
            {event.timeline && event.timeline.length > 0 && (
              <div className="mb-16">
                <h3 className="font-anton text-[24px] tracking-wide uppercase mb-8">Event Timeline</h3>
                
                <div className="relative pl-[30px]">
                  {/* Vertical Line */}
                  <div className="absolute left-[5px] top-[10px] bottom-[10px] w-[2px] bg-[var(--color-border)]" />
                  
                  {event.timeline.map((item, i) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="relative pb-10 last:pb-0">
                        {/* Dot */}
                        <div className={cn(
                          "absolute left-[-30px] top-[4px] w-[12px] h-[12px] rounded-full",
                          isFirst 
                            ? "bg-[var(--color-lime)] shadow-[0_0_0_4px_rgba(215,255,61,0.2)]" 
                            : "bg-[#333]"
                        )} />
                        
                        <div className="text-[12.5px] text-[var(--color-text-faint)] mb-1">{item.subtitle}</div>
                        <div className="text-[16px] font-bold mb-1.5">{item.title}</div>
                        <div className="text-[13.5px] text-[var(--color-text-muted)] leading-[1.5] max-w-[500px]">
                          {item.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Registration Panel */}
          <div className="relative">
            <div className="sticky top-[120px] p-8 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-lg">
              <div className="text-[13px] text-[var(--color-text-faint)] mb-1">Entry</div>
              <div className="text-[20px] font-bold mb-6">{event.prize}</div>
              
              <button 
                className="btn btn-primary w-full shadow-none hover:shadow-none mb-4"
                onClick={() => {
                  onClose();
                  setTimeout(onRegister, 400); // Trigger standard registration flow
                }}
              >
                Register for this event
              </button>
              
              <button className="w-full py-3.5 rounded-full border border-[var(--color-border)] font-semibold text-[14px] hover:bg-white/5 transition-colors mb-8">
                Add to calendar
              </button>
              
              <div className="flex flex-col gap-4 text-[13px]">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[var(--color-text-faint)]">Date</span>
                  <span className="font-semibold">{event.date}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[var(--color-text-faint)]">Venue</span>
                  <span className="font-semibold">{event.venue}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[var(--color-text-faint)]">College</span>
                  <span className="font-semibold">{event.college}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[var(--color-text-faint)]">Expected</span>
                  <span className="font-semibold">{event.participants}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
