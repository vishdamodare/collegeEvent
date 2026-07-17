import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center font-archivo text-white">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)] mb-3" />
      <p className="text-[13px] text-white/40 font-bold uppercase tracking-widest">
        Loading Dashboard Data...
      </p>
    </div>
  );
}
