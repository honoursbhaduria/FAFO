"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Newspaper, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import type { FeedResponse, FeedArticle, FeedFilter, FeedSort } from "@/types/news";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import RefreshButton from "./RefreshButton";
import ArticleCard from "./ArticleCard";
import AlertCard from "./AlertCard";
import OpportunityCard from "./OpportunityCard";

export default function NewsFeedShell() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [activeSort, setActiveSort] = useState<FeedSort>("relevance");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // ── Fetch feed ──────────────────────────────────────────
  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/news/feed");
      if (!res.ok) throw new Error("Failed to fetch feed");
      const data: FeedResponse = await res.json();
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // ── Refresh ─────────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/news/refresh", { method: "POST", body: JSON.stringify({}) });
      if (res.status === 429) {
        const data = await res.json();
        if (feed) setFeed({ ...feed, cooldownEndsAt: data.cooldownEndsAt });
        return;
      }
      if (!res.ok) throw new Error("Refresh failed");
      const data: FeedResponse = await res.json();
      setFeed(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Bookmark / Read handlers ────────────────────────────
  const handleBookmark = async (articleId: string) => {
    try {
      const res = await fetch("/api/news/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (feed) {
        const updateArticle = (a: FeedArticle) =>
          a.id === articleId ? { ...a, isBookmarked: data.isBookmarked } : a;
        setFeed({
          ...feed,
          urgentAlerts: feed.urgentAlerts.map(updateArticle),
          opportunities: feed.opportunities.map(updateArticle),
          regularFeed: feed.regularFeed.map(updateArticle),
        });
      }
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
      if (feed) {
        const updateArticle = (a: FeedArticle) =>
          a.id === articleId ? { ...a, isRead: true } : a;
        setFeed({
          ...feed,
          urgentAlerts: feed.urgentAlerts.map(updateArticle),
          opportunities: feed.opportunities.map(updateArticle),
          regularFeed: feed.regularFeed.map(updateArticle),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── All articles merged for filtering ───────────────────
  const allArticles = useMemo(() => {
    if (!feed) return [];
    return [
      ...feed.urgentAlerts,
      ...feed.opportunities,
      ...feed.regularFeed,
    ];
  }, [feed]);

  // ── Search filter ───────────────────────────────────────
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return allArticles;
    const q = searchQuery.toLowerCase();
    return allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.matchedKeywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [allArticles, searchQuery]);

  // ── Category filter ─────────────────────────────────────
  const categoryFiltered = useMemo(() => {
    switch (activeFilter) {
      case "alerts":
        return searchFiltered.filter((a) => a.isUrgent);
      case "opportunities":
        return searchFiltered.filter((a) =>
          feed?.opportunities.some((o) => o.id === a.id)
        );
      case "bookmarked":
        return searchFiltered.filter((a) => a.isBookmarked);
      case "unread":
        return searchFiltered.filter((a) => !a.isRead);
      default:
        return searchFiltered;
    }
  }, [searchFiltered, activeFilter, feed]);

  // ── Sort ────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...categoryFiltered];
    switch (activeSort) {
      case "newest":
        return arr.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
      case "oldest":
        return arr.sort(
          (a, b) =>
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
        );
      default:
        return arr.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }, [categoryFiltered, activeSort]);

  // ── Pagination ──────────────────────────────────────────
  const paginatedArticles = sorted.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedArticles.length < sorted.length;

  // ── Counts ──────────────────────────────────────────────
  const counts = useMemo(() => {
    return {
      all: allArticles.length,
      alerts: allArticles.filter((a) => a.isUrgent).length,
      opportunities: feed?.opportunities.length ?? 0,
      bookmarked: allArticles.filter((a) => a.isBookmarked).length,
      unread: allArticles.filter((a) => !a.isRead).length,
    };
  }, [allArticles, feed]);

  // ── Loading state ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-900">Building your feed...</p>
          <p className="text-sm text-slate-500 mt-1">
            Analyzing your profile and fetching relevant news
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-900">Unable to load feed</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={fetchFeed}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const lastUpdated = feed?.lastUpdated
    ? new Date(feed.lastUpdated).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Newspaper size={20} className="text-white" />
            </div>
            Smart Feed
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>
        <RefreshButton
          cooldownEndsAt={feed?.cooldownEndsAt}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />
      </div>

      {/* Search */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Filter bar */}
      <FilterBar
        activeFilter={activeFilter}
        activeSort={activeSort}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setPage(1);
        }}
        onSortChange={(s) => {
          setActiveSort(s);
          setPage(1);
        }}
        counts={counts}
      />

      {/* Urgent Alerts Section */}
      {activeFilter === "all" &&
        feed &&
        feed.urgentAlerts.length > 0 &&
        !searchQuery && (
          <section>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-500" />
              Important Alerts
              <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-md">
                {feed.urgentAlerts.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feed.urgentAlerts.map((article) => (
                <AlertCard
                  key={article.id}
                  article={article}
                  onBookmark={handleBookmark}
                  onRead={handleRead}
                />
              ))}
            </div>
          </section>
        )}

      {/* Opportunities Section */}
      {activeFilter === "all" &&
        feed &&
        feed.opportunities.length > 0 &&
        !searchQuery && (
          <section>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-emerald-500" />
              Latest Opportunities
              <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-md">
                {feed.opportunities.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feed.opportunities.map((article) => (
                <OpportunityCard
                  key={article.id}
                  article={article}
                  onBookmark={handleBookmark}
                  onRead={handleRead}
                />
              ))}
            </div>
          </section>
        )}

      {/* Main feed / filtered view */}
      <section>
        {(activeFilter !== "all" || searchQuery) && (
          <h2 className="text-lg font-black text-slate-900 mb-4">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeFilter === "alerts"
              ? "All Alerts"
              : activeFilter === "opportunities"
              ? "All Opportunities"
              : activeFilter === "bookmarked"
              ? "Your Bookmarks"
              : activeFilter === "unread"
              ? "Unread Articles"
              : "Your Personalized Feed"}
            <span className="ml-2 text-sm font-bold text-slate-400">
              ({sorted.length})
            </span>
          </h2>
        )}

        {activeFilter === "all" && !searchQuery && (
          <h2 className="text-lg font-black text-slate-900 mb-4">
            Your Personalized Feed
            <span className="ml-2 text-sm font-bold text-slate-400">
              ({feed?.regularFeed.length ?? 0})
            </span>
          </h2>
        )}

        {paginatedArticles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Newspaper className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-bold text-slate-600">No articles found</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Check back later for new articles"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(activeFilter === "all" && !searchQuery
                ? (feed?.regularFeed ?? []).slice(0, page * ITEMS_PER_PAGE)
                : paginatedArticles
              ).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onBookmark={handleBookmark}
                  onRead={handleRead}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
