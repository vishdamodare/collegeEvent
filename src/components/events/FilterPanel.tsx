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
  { label: "Any status", value: "" },
  { label: "Registration open", value: "open" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const TIMEFRAME_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
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

  // Empty categories only add noise; keep one visible if it is the active filter
  const visibleCategories = categories.filter((c) => (c.count ?? 1) > 0 || c.value === selectedCategory);

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
          aria-expanded={expanded}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text-muted hover:border-border-bright transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-lime" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-text-faint hover:text-lime transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Always visible on desktop, toggled on mobile. CSS decides visibility so server and client render the same markup. */}
      <div className={`space-y-4 lg:block ${expanded ? "block" : "hidden"}`}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          <PillButton active={!selectedCategory} onClick={() => onCategoryChange("")}>
            All
          </PillButton>
          {visibleCategories.map((cat) => (
            <PillButton key={cat.value} active={selectedCategory === cat.value} onClick={() => onCategoryChange(cat.value)}>
              {cat.label}
              {cat.count !== undefined && <span className="text-[12px] opacity-60 ml-1.5">{cat.count}</span>}
            </PillButton>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="When" value={selectedTimeframe} options={TIMEFRAME_OPTIONS} onChange={onTimeframeChange} />
          <FilterSelect label="Status" value={selectedStatus} options={STATUS_OPTIONS} onChange={onStatusChange} />
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="hidden lg:flex items-center gap-1.5 text-sm text-text-faint hover:text-lime transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-faint">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-text-main focus:outline-none focus:border-lime/60 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0D1124] text-[#F3F5FB]">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
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
      aria-pressed={active}
      className={`px-4 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
        active
          ? "bg-lime border-lime text-[#0B0B08]"
          : "bg-transparent border-border-bright text-text-main hover:bg-card-hover"
      }`}
    >
      {children}
    </button>
  );
}
