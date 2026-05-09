"use client";

import { AlertTriangle, ExternalLink, Bookmark, Clock } from "lucide-react";
import type { FeedArticle } from "@/types/news";

interface AlertCardProps {
  article: FeedArticle;
  onBookmark: (articleId: string) => void;
  onRead: (articleId: string) => void;
}

export default function AlertCard({ article, onBookmark, onRead }: AlertCardProps) {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div
      id={`alert-${article.id}`}
      className="group relative bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-200/60 shadow-sm hover:shadow-lg hover:border-red-300 transition-all duration-300 overflow-hidden"
    >
      {/* Urgency accent bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-xl shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                Urgent
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {publishedDate}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 leading-snug group-hover:text-red-700 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3 pl-12">
          {article.description}
        </p>

        {/* Urgency reason */}
        {article.urgencyReason && (
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-3 pl-12">
            ⚠ {article.urgencyReason}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pl-12 pt-3 border-t border-red-100">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {article.source}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(article.id)}
              className={`p-1.5 rounded-lg transition-all ${
                article.isBookmarked
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:text-blue-600"
              }`}
            >
              <Bookmark size={14} fill={article.isBookmarked ? "currentColor" : "none"} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(article.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              View Now
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
