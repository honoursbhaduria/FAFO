"use client";

import { useState, useMemo } from "react";
import type { QuestionOption } from "@/types/questionnaire";
import { Search } from "lucide-react";

interface DropdownProps {
  options: QuestionOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({ options, value, onChange, placeholder }: DropdownProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || "Search..."}
          autoFocus
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-medium text-brand-600 placeholder:text-slate-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all"
        />
      </div>
      <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-100 divide-y divide-slate-50">
        {filtered.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full px-5 py-3.5 text-left font-medium text-sm transition-all ${
              value === opt.value
                ? "bg-brand-50 text-brand-700 font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">No matches found</p>
        )}
      </div>
    </div>
  );
}
