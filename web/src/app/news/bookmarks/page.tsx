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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bookmark size={20} className="text-white" />
            </div>
            Bookmarks
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Your saved articles for later reading
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="font-bold text-slate-600">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Newspaper className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-bold text-slate-600">No bookmarks yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Bookmark articles from your Smart Feed to save them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
