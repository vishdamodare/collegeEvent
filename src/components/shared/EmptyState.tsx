"use client";

import { motion } from "framer-motion";
import { SearchX, Calendar, Bookmark, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap: Record<string, LucideIcon> = {
  search: SearchX,
  calendar: Calendar,
  bookmark: Bookmark,
};

export function EmptyState({ icon: Icon = SearchX, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-text-faint" />
      </div>
      <h3 className="text-lg font-semibold text-text-main mb-2 font-[family-name:var(--font-archivo)]">
        {title}
      </h3>
      <p className="text-sm text-text-faint max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary btn-sm"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
