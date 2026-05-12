"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Newspaper, AlertTriangle, Sparkles, Loader2, MapPin, Briefcase, Tag, ArrowRight, Monitor, Factory, Utensils, Sprout, Activity, ShoppingBag, GraduationCap, Scissors, Building, Truck, Palette, Zap, Building2, BarChart, Target, LucideIcon } from "lucide-react";
import type { FeedResponse, FeedArticle, FeedFilter, FeedSort } from "@/types/news";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import RefreshButton from "./RefreshButton";
import ArticleCard from "./ArticleCard";
import AlertCard from "./AlertCard";
import OpportunityCard from "./OpportunityCard";
import Link from "next/link";

/** Sector icon mapping */
const SECTOR_ICONS: Record<string, LucideIcon> = {
  "IT / Software": Monitor,
  "Manufacturing": Factory,
  "Food & Beverage": Utensils,
  "Agriculture": Sprout,
  "Healthcare": Activity,
  "Retail / Trading": ShoppingBag,
  "Education": GraduationCap,
  "Textile & Handicraft": Scissors,
  "Construction": Building,
  "Transport & Logistics": Truck,
  "Services": Briefcase,
  "Handicraft": Palette,
  "Renewable Energy": Zap,
  "Tourism & Hospitality": Building2,
  "General": BarChart,
};

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
      const data = await res.json();
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news feed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/news/refresh", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        if (data.error) {
          // If refresh failed due to cooldown, just refetch the current feed to update cooldown UI
          await fetchFeed();
          return;
        }
        throw new Error("Failed to refresh feed");
      }
      const data = await res.json();
      setFeed(data);
    } catch (err) {
      console.error("Refresh failed:", err);
      // Fallback to regular fetch on error
      await fetchFeed();
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Handlers ────────────────────────────────────────────
  const toggleBookmark = async (articleId: string) => {
    if (!feed) return;
    
    // Optimistic update
    const updatedFeed = { ...feed };
    const article = [...updatedFeed.regularFeed, ...updatedFeed.urgentAlerts, ...updatedFeed.opportunities]
      .find(a => a.id === articleId);
    
    if (article) {
      article.isBookmarked = !article.isBookmarked;
      setFeed(updatedFeed);
    }

    try {
      await fetch(`/api/news/bookmark?id=${articleId}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to update bookmark:", err);
    }
  };

  const markAsRead = async (articleId: string) => {
    if (!feed) return;
    
    // Optimistic update
    const updatedFeed = { ...feed };
    const article = [...updatedFeed.regularFeed, ...updatedFeed.urgentAlerts, ...updatedFeed.opportunities]
      .find(a => a.id === articleId);
    
    if (article && !article.isRead) {
      article.isRead = true;
      setFeed(updatedFeed);
    }

    try {
      await fetch(`/api/news/read?id=${articleId}`, { method: "POST" });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // ── Filtering & Sorting ─────────────────────────────────
  const processedArticles = useMemo(() => {
    if (!feed) return [];

    const regularFeed = feed.regularFeed || [];
    const urgentAlerts = feed.urgentAlerts || [];
    const opportunities = feed.opportunities || [];

    let articles: FeedArticle[] = [];
    if (activeFilter === "all") {
      articles = [...regularFeed, ...urgentAlerts, ...opportunities];
    } else if (activeFilter === "alerts") {
      articles = urgentAlerts;
    } else if (activeFilter === "opportunities") {
      articles = opportunities;
    } else if (activeFilter === "bookmarked") {
      articles = [...regularFeed, ...urgentAlerts, ...opportunities].filter(a => a.isBookmarked);
    } else if (activeFilter === "unread") {
      articles = [...regularFeed, ...urgentAlerts, ...opportunities].filter(a => !a.isRead);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) ||
        a.matchedKeywords.some(k => k.toLowerCase().includes(q))
      );
    }

    // Sort
    return articles.sort((a, b) => {
      if (activeSort === "newest") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (activeSort === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return b.relevanceScore - a.relevanceScore;
    });
  }, [feed, activeFilter, searchQuery, activeSort]);

  // Pagination
  const totalArticles = processedArticles.length;
  const currentArticles = processedArticles.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = currentArticles.length < totalArticles;

  // ── Counts ──────────────────────────────────────────────
  const counts = useMemo(() => {
    if (!feed) return { all: 0, alerts: 0, opportunities: 0, bookmarked: 0, unread: 0 };
    
    const regularFeed = feed.regularFeed || [];
    const urgentAlerts = feed.urgentAlerts || [];
    const opportunities = feed.opportunities || [];
    const all = [...regularFeed, ...urgentAlerts, ...opportunities];

    return {
      all: all.length,
      alerts: urgentAlerts.length,
      opportunities: opportunities.length,
      bookmarked: all.filter(a => a.isBookmarked).length,
      unread: all.filter(a => !a.isRead).length,
    };
  }, [feed]);

  // ── Profile context ─────────────────────────────────────
  const ctx = feed?.profileContext;
  const hasProfile = ctx && ctx.sector && ctx.sector !== "General";
  const SectorIcon = ctx ? (SECTOR_ICONS[ctx.sector] || BarChart) : BarChart;

  // ── Loading state ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Syncing with Intelligence Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-6 bg-red-50 rounded-[32px] border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-red-900">Feed Offline</h3>
        <p className="text-red-600 mt-2 font-medium">{error}</p>
        <button 
          onClick={fetchFeed}
          className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Smart Feed
          </h1>
          <p className="text-slate-500 mt-2 text-base font-medium max-w-2xl">
            Real-time regulatory alerts, industry opportunities, and tailored business intelligence.
          </p>
        </div>
        <RefreshButton 
          onRefresh={handleRefresh} 
          isLoading={isRefreshing} 
          cooldownEndsAt={feed?.cooldownEndsAt}
        />
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3 space-y-6">
          <SearchBar onSearch={setSearchQuery} />
          <FilterBar 
            activeFilter={activeFilter} 
            activeSort={activeSort} 
            onFilterChange={setActiveFilter} 
            onSortChange={setActiveSort}
            counts={counts}
          />
        </div>
        
        {/* Profile Summary Card */}
        {hasProfile ? (
          <div 
            className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <SectorIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Profile</p>
                  <p className="text-sm font-black text-white truncate">{ctx.sector}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  <MapPin size={10} />
                  {ctx.state || "All India"}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  <Briefcase size={10} />
                  {ctx.stage || "Established"}
                </div>
              </div>
              <Link 
                href="/questionnaire"
                className="mt-6 block w-full py-3 text-center bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Update Profile
              </Link>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-600 rounded-full blur-[80px] opacity-20" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600 rounded-full blur-[80px] opacity-20" />
          </div>
        ) : (
          /* No profile CTA */
          <div
            id="no-profile-cta"
            className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-8 h-8 text-slate-900" />
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">Personalize Feed</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              Complete your profile to see sector-specific regulations and opportunities.
            </p>
            <Link
              href="/questionnaire"
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Feed Content */}
      <section className="space-y-8">
        {processedArticles.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
              <Newspaper size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No items found</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Try clearing filters or search to explore the latest business intelligence.</p>
          </div>
        ) : (
          <>
            {/* Personalized Header */}
            {activeFilter === "all" && !searchQuery && (
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center px-2">
                Your Intelligence Stream
                {hasProfile && (
                  <span className="ml-4 flex items-center gap-1.5 text-brand-600">
                    <SectorIcon size={12} /> {ctx?.sector}
                  </span>
                )}
                <span className="ml-auto opacity-50">
                  {processedArticles.length} units
                </span>
              </h2>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArticles.map((article) => {
                if (article.type === "alert") {
                  return (
                    <AlertCard
                      key={article.id}
                      article={article}
                      onBookmark={toggleBookmark}
                      onRead={markAsRead}
                    />
                  );
                }
                if (article.type === "opportunity") {
                  return (
                    <OpportunityCard
                      key={article.id}
                      article={article}
                      onBookmark={toggleBookmark}
                      onRead={markAsRead}
                    />
                  );
                }
                return (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onBookmark={toggleBookmark}
                    onRead={markAsRead}
                  />
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-10 py-4 bg-white border border-slate-200 rounded-[20px] font-black text-xs text-slate-900 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  Load More Intelligence
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
