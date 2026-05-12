"use client";

import { Bookmark, ExternalLink, Clock, Eye } from "lucide-react";
import type { FeedArticle, RelevanceLevel } from "@/types/news";
import { getRelevanceLevel } from "@/types/news";

interface ArticleCardProps {
  article: FeedArticle;
  onBookmark: (articleId: string) => void;
  onRead: (articleId: string) => void;
}

const relevanceColors: Record<RelevanceLevel, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-brand-100 text-brand-700",
  "Very High": "bg-emerald-100 text-emerald-700",
};

export default function ArticleCard({
  article,
  onBookmark,
  onRead,
}: ArticleCardProps) {
  const level = getRelevanceLevel(article.relevanceScore);
  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div
      id={`article-${article.id}`}
      className={`group bg-white rounded-[32px] border border-slate-100 transition-all duration-500 overflow-hidden ${
        article.isRead ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-44 overflow-hidden border-b border-slate-50">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              {article.source}
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock size={10} />
              {publishedDate}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-current/5 ${relevanceColors[level]}`}>
            {level}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-tight mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-5 font-medium">
          {article.description}
        </p>

        {/* Matched keywords */}
        {article.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {article.matchedKeywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-bold text-slate-400 uppercase tracking-tighter"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(article.id);
              }}
              className={`p-2 rounded-xl transition-all ${
                article.isBookmarked
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={article.isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark size={16} fill={article.isBookmarked ? "currentColor" : "none"} />
            </button>
            {!article.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(article.id);
                }}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                title="Mark as read"
              >
                <Eye size={16} />
              </button>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead(article.id)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest border border-slate-100"
          >
            Read
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
