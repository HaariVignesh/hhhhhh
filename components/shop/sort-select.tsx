"use client";

import { SORT_OPTIONS } from "@/types";

interface SortSelectProps {
  currentSort: string;
  onSortChange?: (value: string) => void;
}

export default function SortSelect({ currentSort, onSortChange }: SortSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange?.(e.target.value);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
