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
  High: "bg-blue-100 text-blue-700",
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
      className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden ${
        article.isRead ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {article.source}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock size={10} />
              {publishedDate}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${relevanceColors[level]}`}>
            {level}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
          {article.description}
        </p>

        {/* Matched keywords */}
        {article.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.matchedKeywords.slice(0, 5).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-500"
              >
                {kw}
              </span>
            ))}
            {article.matchedKeywords.length > 5 && (
              <span className="text-[10px] font-bold text-slate-400">
                +{article.matchedKeywords.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(article.id);
              }}
              className={`p-2 rounded-lg transition-all ${
                article.isBookmarked
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-blue-600"
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
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            Read More
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
