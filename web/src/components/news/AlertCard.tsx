"use client";

import { AlertTriangle, ExternalLink, Bookmark, Clock, AlertCircle } from "lucide-react";
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
      className="group relative bg-white rounded-[32px] border border-red-100 transition-all duration-500 overflow-hidden"
    >
      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 bg-red-50 rounded-2xl border border-red-100 shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-md border-b-2 border-red-800">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                Urgent
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {publishedDate}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-red-700 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 pl-14 font-medium">
          {article.description}
        </p>

        {/* Urgency reason */}
        {article.urgencyReason && (
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 pl-14 flex items-center gap-1.5">
            <AlertCircle size={12} /> {article.urgencyReason}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pl-14 pt-4 border-t border-slate-50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {article.source}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(article.id)}
              className={`p-2 rounded-xl transition-all ${
                article.isBookmarked
                  ? "bg-slate-900 text-white "
                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <Bookmark size={16} fill={article.isBookmarked ? "currentColor" : "none"} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRead(article.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest"
            >
              View
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
