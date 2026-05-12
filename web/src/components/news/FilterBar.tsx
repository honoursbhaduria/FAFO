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
              className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f.key
                  ? "bg-slate-900 text-white border border-slate-900"
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[9px] font-black rounded-md ${
                    activeFilter === f.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-400"
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
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</span>
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as FeedSort)}
          className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 cursor-pointer appearance-none"
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
