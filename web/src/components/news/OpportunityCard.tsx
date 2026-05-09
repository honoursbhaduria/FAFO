"use client";

import { Sparkles, ExternalLink, Bookmark, Clock, ArrowUpRight } from "lucide-react";
import type { FeedArticle } from "@/types/news";

interface OpportunityCardProps {
  article: FeedArticle;
  onBookmark: (articleId: string) => void;
  onRead: (articleId: string) => void;
}

export default function OpportunityCard({
  article,
  onBookmark,
  onRead,
}: OpportunityCardProps) {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div
      id={`opportunity-${article.id}`}
      className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200/60 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden"
    >
      {/* Green accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
            <Sparkles size={18} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                Opportunity
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {publishedDate}
              </span>
            </div>
            <h3 className="font-bold text-brand-600 leading-snug group-hover:text-emerald-700 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 pl-12">
          {article.description}
        </p>

        {/* Matched keywords */}
        {article.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 pl-12">
            {article.matchedKeywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded-md text-[10px] font-bold text-emerald-700"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pl-12 pt-3 border-t border-emerald-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {article.source}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(article.id)}
              className={`p-1.5 rounded-lg transition-all ${
                article.isBookmarked
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-400 hover:text-brand-600"
              }`}
            >
              <Bookmark size={14} fill={article.isBookmarked ? "currentColor" : "none"} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(article.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 group/btn"
            >
              Learn More
              <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
