"use client";

import type { FeedFilter, FeedSort } from "@/types/news";

interface FilterBarProps {
  activeFilter: FeedFilter;
  activeSort: FeedSort;
  onFilterChange: (filter: FeedFilter) => void;
  onSortChange: (sort: FeedSort) => void;
  counts: {
    all: number;
    alerts: number;
    opportunities: number;
    bookmarked: number;
    unread: number;
  };
}

const filters: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "alerts", label: "Alerts" },
  { key: "opportunities", label: "Opportunities" },
  { key: "bookmarked", label: "Bookmarked" },
  { key: "unread", label: "Unread" },
];

const sorts: { key: FeedSort; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
];

export default function FilterBar({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
  counts,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              onClick={() => onFilterChange(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeFilter === f.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-md ${
                    activeFilter === f.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by</span>
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as FeedSort)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {sorts.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
