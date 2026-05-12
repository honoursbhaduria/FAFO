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
    <div className="group bg-white rounded-xl border border-slate-200 transition-all duration-300 overflow-hidden">
      {/* Top accent */}
      <div className="h-0.5 bg-slate-200" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 font-black text-xs shrink-0 border border-brand-100">
            #{rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-brand-600 transition-colors">
              {scheme.scheme_name}
            </h3>
            {scheme.ministry && (
              <p className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-medium">
                <Building2 size={10} />
                {scheme.ministry}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-600 leading-snug mb-3 line-clamp-3 font-medium">
          {scheme.description || "Government scheme — click to learn more."}
        </p>

        {/* Match reasons */}
        <div className="flex flex-wrap gap-1 mb-3">
          {scheme.matchReasons.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded border border-emerald-100">
              <Award size={8} />
              {r}
            </span>
          ))}
        </div>

        {/* Categories */}
        {scheme.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {scheme.categories.slice(0, 3).map((cat, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Score: {scheme.relevanceScore}
          </div>
          <Link
            href={`/schemes/${scheme.api_id}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-[10px] font-bold rounded hover:bg-brand-700 transition-all uppercase tracking-wider"
          >
            Details
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
