"use client";

import type { SchemeResult } from "@/types/questionnaire";
import SchemeCard from "./SchemeCard";

interface RecommendationListProps {
  schemes: SchemeResult[];
  filtersApplied: string[];
  queryTime: number;
}

export default function RecommendationList({ schemes, filtersApplied, queryTime }: RecommendationListProps) {
  return (
    <div className="space-y-6">
      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-2">
        {filtersApplied.map((f, i) => (
          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            {f}
          </span>
        ))}
        <span className="text-xs text-slate-400 ml-auto">
          {schemes.length} schemes found in {queryTime}ms
        </span>
      </div>

      {/* Cards grid */}
      {schemes.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-bold text-slate-600">No schemes matched your criteria</p>
          <p className="text-sm text-slate-400 mt-1">Try broadening your answers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {schemes.map((s, i) => (
            <SchemeCard key={s.api_id} scheme={s} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
