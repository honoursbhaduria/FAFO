"use client";

import { Award, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SchemeResult } from "@/types/questionnaire";

interface SchemeCardProps {
  scheme: SchemeResult;
  rank: number;
}

export default function SchemeCard({ scheme, rank }: SchemeCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
            #{rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              {scheme.scheme_name}
            </h3>
            {scheme.ministry && (
              <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Building2 size={10} />
                {scheme.ministry}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
          {scheme.description || "Government scheme — click to learn more."}
        </p>

        {/* Match reasons */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {scheme.matchReasons.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
              <Award size={8} />
              {r}
            </span>
          ))}
        </div>

        {/* Categories */}
        {scheme.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scheme.categories.slice(0, 3).map((cat, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Score: {scheme.relevanceScore}
          </div>
          <Link
            href={`/schemes/${scheme.api_id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
          >
            View Details
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
