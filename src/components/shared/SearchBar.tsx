"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState, useRef } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export function SearchBar({ 
  placeholder = "Search events...", 
  defaultValue = "",
  onSearch,
  debounceMs = 400 
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Re-sync when the parent changes defaultValue (e.g. filters reset) — React's "adjust state on prop change"
  const [syncedDefault, setSyncedDefault] = useState(defaultValue);
  if (defaultValue !== syncedDefault) {
    setSyncedDefault(defaultValue);
    setValue(defaultValue);
  }

  const debouncedSearch = (query: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(query), debounceMs);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    clearTimeout(timer.current);
    setValue("");
    onSearch("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex-1 min-w-0 sm:max-w-md"
    >
      <Search className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 bg-card border border-border rounded-xl text-sm text-text-main placeholder:text-text-faint focus:outline-none focus:border-lime/50 focus:ring-1 focus:ring-lime/20 transition-all backdrop-blur-sm"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-card-hover transition-colors"
        >
          <X className="w-3.5 h-3.5 text-text-faint" />
        </button>
      )}
    </motion.div>
  );
}
