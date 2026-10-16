"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  color?: string | null;
}

interface FilterPanelProps {
  categories: FilterOption[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Registration Open", value: "open" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const TIMEFRAME_OPTIONS = [
  { label: "All Time", value: "" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
];

export function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedTimeframe,
  onTimeframeChange,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = selectedCategory || selectedStatus || selectedTimeframe;

  const clearAll = () => {
    onCategoryChange("");
    onStatusChange("");
    onTimeframeChange("");
  };

  return (
    <div className="space-y-4">
      {/* Toggle button for mobile */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text-muted hover:border-border-bright transition-all"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-lime" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-text-faint hover:text-lime transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter content — always visible on desktop, toggle on mobile.
          CSS decides visibility so server and client render the same markup. */}
      <div className={`space-y-4 lg:block ${expanded ? "block" : "hidden"}`}>
            {/* Category pills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-faint uppercase tracking-wider">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  active={!selectedCategory}
                  onClick={() => onCategoryChange("")}
                >
                  All
                </PillButton>
                {categories.map((cat) => (
                  <PillButton
                    key={cat.value}
                    active={selectedCategory === cat.value}
                    onClick={() => onCategoryChange(cat.value)}
                  >
                    {cat.label}
                    {cat.count !== undefined && (
                      <span className="text-[10px] opacity-60 ml-1">({cat.count})</span>
                    )}
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Timeframe pills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-faint uppercase tracking-wider">
                When
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAME_OPTIONS.map((opt) => (
                  <PillButton
                    key={opt.value}
                    active={selectedTimeframe === opt.value}
                    onClick={() => onTimeframeChange(opt.value)}
                  >
                    {opt.label}
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Status pills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-faint uppercase tracking-wider">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <PillButton
                    key={opt.value}
                    active={selectedStatus === opt.value}
                    onClick={() => onStatusChange(opt.value)}
                  >
                    {opt.label}
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="hidden lg:flex items-center gap-1.5 text-xs text-text-faint hover:text-lime transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            )}
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
        active
          ? "bg-lime border-lime text-[#0B0B08]"
          : "bg-card border-border text-text-muted hover:border-border-bright hover:text-text-main"
      }`}
    >
      {children}
    </button>
  );
}
