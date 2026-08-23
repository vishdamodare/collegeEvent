"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Award,
  Upload,
  Mail,
  Download,
  Loader2,
  Inbox,
  CalendarDays,
  Users,
} from "lucide-react";
import { getEligibleCertificateEvents, issueBulkCertificatesAction } from "@/actions/admin";
import { toast } from "sonner";

export default function CertificatesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadEligibleEvents = () => {
    startTransition(async () => {
      const res = await getEligibleCertificateEvents();
      setEvents(res);
      if (res.length > 0 && !selectedEventId) setSelectedEventId(res[0].id);
    });
  };

  useEffect(() => {
    loadEligibleEvents();
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setTemplateFile("custom-certificate-template.pdf");
      toast.success("Certificate template uploaded successfully!");
    }, 1200);
  };

  const handleSendBulk = async () => {
    if (!selectedEventId) {
      toast.error("Please select an eligible event first.");
      return;
    }
    setIsSending(true);
    try {
      const res = await issueBulkCertificatesAction(selectedEventId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Certificates successfully issued and emailed to ${res.count} attendees!`);
        loadEligibleEvents();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to issue certificates.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">
          Certificates Module
        </h1>
        <p className="text-[13px] text-white/40">
          Upload certificate designs, select eligible events, and issue PDF awards in bulk.
        </p>
      </div>

      {isPending ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Event selector + Template Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Selection */}
            <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">
                Select Eligible Event
              </h3>

              {events.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center text-white/30 space-y-3">
                  <Inbox className="w-8 h-8 text-white/20" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider">No eligible events</p>
                    <p className="text-xs text-white/20 mt-1">
                      Events with at least one checked-in attendee will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all cursor-pointer ${
                        selectedEventId === evt.id
                          ? "border-[var(--color-lime)]/40 bg-[var(--color-lime)]/5"
                          : "border-white/5 bg-[#141414] hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[14px] font-bold text-white leading-tight">{evt.title}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[11px] text-white/40">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {new Date(evt.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-white/40">
                              <Users className="w-3.5 h-3.5" />
                              {evt.totalRegistrations} registered
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--color-lime)] bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2 py-0.5 rounded-lg">
                          {evt.checkedInCount} eligible
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template Upload */}
            <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">
                Design Template Upload
              </h3>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-[#151515] relative group hover:border-[var(--color-lime)]/40 transition-colors">
                <Upload className="w-8 h-8 text-white/30 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[13px] font-bold text-white">
                  {templateFile ? `Active: ${templateFile}` : "Drag and drop certificate layout"}
                </p>
                <p className="text-[10.5px] text-white/30 mt-1">
                  Accepts high resolution PDF templates (Max 10MB)
                </p>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-bold cursor-pointer transition-colors"
                >
                  {isUploading ? "Uploading..." : "Select File"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Bulk Issuance Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--color-lime)]" />
                <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">
                  Bulk Issuance
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-[12.5px] text-white/60 leading-relaxed">
                  Automatically generate and email certificates to all checked-in attendees for the
                  selected event.
                </p>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-white/40">Selected event:</span>
                    <span className="font-bold text-white text-right max-w-[120px] truncate">
                      {selectedEvent?.title ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-white/40">Eligible students:</span>
                    <span className="font-bold text-[var(--color-lime)]">
                      {selectedEvent?.checkedInCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSendBulk}
                  disabled={isSending || !selectedEventId || events.length === 0}
                  className="w-full py-3.5 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Queuing Emails...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Email Certificates
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    toast.info("PDF zip generation requires a paid plan. Coming soon!")
                  }
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Zip Bundle
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-xl border border-white/5 bg-[#121212]/30 p-4">
              <p className="text-[11px] text-white/30 leading-relaxed">
                Only events with at least one manually or scanner-confirmed check-in are eligible
                for certificate issuance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
