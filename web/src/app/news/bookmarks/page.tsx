"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ArticleCard from "@/components/news/ArticleCard";
import { Bookmark, Loader2, Newspaper } from "lucide-react";
import type { FeedArticle } from "@/types/news";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<FeedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/news/bookmarks");
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmark = async (articleId: string) => {
    try {
      await fetch("/api/news/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      // Remove from local state (unbookmarked)
      setBookmarks((prev) => prev.filter((a) => a.id !== articleId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRead = async (articleId: string) => {
    try {
      await fetch("/api/news/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      setBookmarks((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Intelligence</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Access your shortlisted articles and regulatory insights.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Syncing Knowledge Vault...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-16 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100">
              <Newspaper size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Empty vault</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">
              Bookmark articles from your Smart Feed to build your personalized knowledge base.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onBookmark={handleBookmark}
                onRead={handleRead}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
