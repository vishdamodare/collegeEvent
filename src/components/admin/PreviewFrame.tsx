"use client";

import { useState } from "react";
import { PreviewDevice } from "@/types/admin/preview";
import { Laptop, Tablet, Smartphone } from "lucide-react";

interface PreviewFrameProps {
  children: React.ReactNode;
}

export function PreviewFrame({ children }: PreviewFrameProps) {
  const [device, setDevice] = useState<PreviewDevice>("DESKTOP");

  const getWidth = () => {
    switch (device) {
      case "MOBILE":
        return "max-w-[375px]";
      case "TABLET":
        return "max-w-[768px]";
      case "DESKTOP":
      default:
        return "max-w-full";
    }
  };

  const getFrameStyles = () => {
    switch (device) {
      case "MOBILE":
        return "border-[12px] border-[#222222] rounded-[36px] shadow-2xl aspect-[9/19] h-[720px] max-h-[85vh] overflow-y-auto";
      case "TABLET":
        return "border-[8px] border-[#222222] rounded-[24px] shadow-2xl aspect-[3/4] h-[720px] max-h-[85vh] overflow-y-auto";
      case "DESKTOP":
      default:
        return "border border-white/10 rounded-xl min-h-[500px] max-h-[85vh] overflow-y-auto w-full";
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Toggle Buttons */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/5 w-fit mx-auto">
        <button
          type="button"
          onClick={() => setDevice("DESKTOP")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
            device === "DESKTOP" 
              ? "bg-[var(--color-lime)] text-[#0B0B08]" 
              : "text-white/40 hover:text-white"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" /> Desktop
        </button>
        <button
          type="button"
          onClick={() => setDevice("TABLET")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
            device === "TABLET" 
              ? "bg-[var(--color-lime)] text-[#0B0B08]" 
              : "text-white/40 hover:text-white"
          }`}
        >
          <Tablet className="w-3.5 h-3.5" /> Tablet
        </button>
        <button
          type="button"
          onClick={() => setDevice("MOBILE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
            device === "MOBILE" 
              ? "bg-[var(--color-lime)] text-[#0B0B08]" 
              : "text-white/40 hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile
        </button>
      </div>

      {/* Frame Canvas */}
      <div className="flex justify-center transition-all duration-300">
        <div className={`w-full transition-all duration-300 bg-[#0B0B08] relative ${getWidth()} ${getFrameStyles()} scrollbar-none`}>
          {device === "MOBILE" && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-[#222222] z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-black/60 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
            </div>
          )}
          <div className={`${device !== "DESKTOP" ? "pt-6 p-2 bg-[#0B0B08]" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
