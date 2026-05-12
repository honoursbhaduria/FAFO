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
      className="group relative bg-white rounded-[32px] border border-emerald-100 transition-all duration-500 overflow-hidden"
    >
      {/* Green accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />

      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0">
            <Sparkles size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-md border-b-2 border-emerald-800">
                Opportunity
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {publishedDate}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-5 pl-14 font-medium">
          {article.description}
        </p>

        {/* Matched keywords */}
        {article.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 pl-14">
            {article.matchedKeywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md text-[9px] font-bold text-emerald-700 uppercase tracking-tighter"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pl-14 pt-4 border-t border-slate-50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {article.source}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(article.id)}
              className={`p-2 rounded-xl transition-all ${
                article.isBookmarked
                  ? "bg-slate-900 text-white "
                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <Bookmark size={16} fill={article.isBookmarked ? "currentColor" : "none"} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(article.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all uppercase tracking-widest"
            >
              Learn
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
