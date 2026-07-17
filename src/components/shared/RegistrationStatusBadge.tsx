import { cn } from "@/utils/cn";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  WAITLISTED: { label: "Waitlisted", className: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
};

interface RegistrationStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function RegistrationStatusBadge({ status, size = "sm", className }: RegistrationStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-card text-text-faint border-border" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}
