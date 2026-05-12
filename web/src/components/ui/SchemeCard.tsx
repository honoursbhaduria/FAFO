"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Landmark, Tag } from "lucide-react";

export interface Scheme {
  title: string;
  summary: string;
  url: string;
  category: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Agriculture": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Education": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  "Healthcare": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Finance & Banking": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Women & Child": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  "Housing": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  "Employment": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "Digital India": { bg: "bg-brand-50", text: "text-brand-700", border: "border-blue-200" },
  "Infrastructure": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  "MSME": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "Energy": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  "Social Welfare": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "Government Scheme": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

function getCategoryStyle(category: string) {
  return categoryColors[category] || categoryColors["Government Scheme"];
}

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = getCategoryStyle(scheme.category);

  // Truncate summary for collapsed view
  const shortSummary = scheme.summary.length > 80
    ? scheme.summary.substring(0, 80) + "..."
    : scheme.summary;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-xl border ${style.border} bg-white transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Gradient accent top bar */}
      <div className="h-0.5 w-full bg-slate-200" />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Landmark className={`w-3.5 h-3.5 ${style.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {scheme.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border border-current/10`}>
                  <Tag className="w-2 h-2" />
                  {scheme.category}
                </span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 mt-1"
          >
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </motion.div>
        </div>

        {/* Collapsed preview */}
        {!isExpanded && (
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug line-clamp-2 font-medium">
            {shortSummary}
          </p>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {scheme.summary}
              </p>
              <a
                href={scheme.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Read more on Wikipedia
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function SchemeCardGrid({ schemes }: { schemes: Scheme[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 mt-3 w-full">
      {schemes.map((scheme, index) => (
        <motion.div
          key={scheme.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
        >
          <SchemeCard scheme={scheme} />
        </motion.div>
      ))}
    </div>
  );
}
