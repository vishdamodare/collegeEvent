import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center font-archivo text-center text-white">
      <AlertCircle className="w-10 h-10 text-[var(--color-lime)] mb-4" />
      <h2 className="text-[22px] font-anton uppercase mb-2">Resource Not Found</h2>
      <p className="text-[13px] text-white/50 mb-6 max-w-sm">
        The organizer resource, registration record, or event sheet you are looking for does not exist.
      </p>
      <Link 
        href="/admin" 
        className="px-5 py-2.5 rounded-xl bg-[var(--color-lime)] text-[#0B0B08] font-bold text-[13px]"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
