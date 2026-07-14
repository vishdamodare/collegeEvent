import { cn } from "@/utils/cn";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
  PUBLISHED: { label: "Open", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  COMPLETED: { label: "Completed", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
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
