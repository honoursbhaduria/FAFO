// ============================================================
// Cache Layer — Neon DB caching for news feed
// ============================================================

import { prisma } from "@/lib/prisma";
import { buildUserKeywordProfile } from "./profile-builder";
import { createDefaultOrchestrator } from "./fetcher";
import { scoreArticles, isOpportunityArticle } from "./scorer";
import type {
  ScoredArticle,
  FeedArticle,
  ArticleInteraction,
  FeedResponse,
  ProfileContext,
  RawArticle,
} from "@/types/news";

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// ────────────────────────────────────────────────────────────
// Interaction helpers
// ────────────────────────────────────────────────────────────

export async function getUserInteractions(
  userId: string
): Promise<ArticleInteraction[]> {
  const rows = await prisma.userNewsInteraction.findMany({
    where: { userId },
    select: {
      articleId: true,
      isRead: true,
      isBookmarked: true,
      readAt: true,
      bookmarkedAt: true,
    },
  });
  return rows.map((r) => ({
    articleId: r.articleId,
    isRead: r.isRead,
    isBookmarked: r.isBookmarked,
    readAt: r.readAt?.toISOString?.() || undefined,
    bookmarkedAt: r.bookmarkedAt?.toISOString?.() || undefined,
  }));
}

export async function toggleBookmark(
  userId: string,
  articleId: string
): Promise<boolean> {
  const existing = await prisma.userNewsInteraction.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    const updated = await prisma.userNewsInteraction.update({
      where: { userId_articleId: { userId, articleId } },
      data: {
        isBookmarked: !existing.isBookmarked,
        bookmarkedAt: !existing.isBookmarked ? new Date() : null,
      },
    });
    return updated.isBookmarked;
  } else {
    const created = await prisma.userNewsInteraction.create({
      data: {
        userId,
        articleId,
        isBookmarked: true,
        bookmarkedAt: new Date(),
      },
    });
    return created.isBookmarked;
  }
}

export async function markAsRead(
  userId: string,
  articleId: string
): Promise<void> {
  await prisma.userNewsInteraction.upsert({
    where: { userId_articleId: { userId, articleId } },
    update: {
      isRead: true,
      readAt: new Date(),
    },
    create: {
      userId,
      articleId,
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function getBookmarkedArticles(
  userId: string
): Promise<FeedArticle[]> {
  await ensureTables();
  // Get bookmarked article IDs
  const interactions = await getUserInteractions(userId);
  const bookmarkedIds = new Set(
    interactions.filter((i) => i.isBookmarked).map((i) => i.articleId)
  );

  if (bookmarkedIds.size === 0) return [];

  // Get cached articles for this user
  const cached = await getCachedArticles(userId);
  if (!cached) return [];

  const interactionMap = new Map(interactions.map((i) => [i.articleId, i]));

  return (cached.articles as unknown as ScoredArticle[])
    .filter((a) => bookmarkedIds.has(a.id))
    .map((a): FeedArticle => {
      const type = a.isUrgent ? "alert" : isOpportunityArticle(a) ? "opportunity" : "regular";
      return {
        ...a,
        isRead: interactionMap.get(a.id)?.isRead ?? false,
        isBookmarked: true,
        type,
      };
    });
}

// ────────────────────────────────────────────────────────────
// Cache invalidation (called when profile/questionnaire changes)
// ────────────────────────────────────────────────────────────

/**
 * Invalidate the cached news feed for a user.
 * Call this whenever the user's BusinessProfile or questionnaire answers change.
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  try {
    await prisma.userNewsCache.delete({
      where: { userId },
    });
    console.log(`[Cache] Invalidated news cache for user ${userId}`);
  } catch (err) {
    // Ignore if cache doesn't exist
  }
}

// ────────────────────────────────────────────────────────────
// Cache read / write
// ────────────────────────────────────────────────────────────

async function getCachedArticles(userId: string) {
  return prisma.userNewsCache.findUnique({
    where: { userId },
  });
}

async function writeCachedArticles(
  userId: string,
  articles: ScoredArticle[],
  isManualRefresh: boolean,
  profileContext?: ProfileContext
): Promise<{ fetchedAt: string; expiresAt: string }> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  await prisma.userNewsCache.upsert({
    where: { userId },
    update: {
      articles: articles as any,
      fetchedAt: now,
      expiresAt: expiresAt,
      profileContext: profileContext as any,
      ...(isManualRefresh ? { lastManualRefresh: now } : {}),
    },
    create: {
      userId,
      articles: articles as any,
      fetchedAt: now,
      expiresAt: expiresAt,
      profileContext: profileContext as any,
      ...(isManualRefresh ? { lastManualRefresh: now } : {}),
    },
  });

  return {
    fetchedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// Core pipeline
// ────────────────────────────────────────────────────────────

async function runFullPipeline(userId: string): Promise<{
  articles: ScoredArticle[];
  profileContext: ProfileContext;
}> {
  // 1. Build keyword profile
  const profile = await buildUserKeywordProfile(userId);

  // 2. Get top keywords for search
  const topKeywords = profile.keywords
    .slice(0, 15)
    .map((k) => k.term);

  if (topKeywords.length === 0) {
    // No profile data → use generic keywords
    topKeywords.push("MSME", "India", "business", "government scheme");
  }

  // 3. Build profile context for UI display
  const profileContext: ProfileContext = {
    sector: profile.sectorLabel || "General",
    state: profile.rawAnswers.state || "",
    stage: profile.rawAnswers.stage || "Established",
    topKeywords: profile.keywords.slice(0, 8).map((k) => k.term),
  };

  // 4. Fetch news articles
  const orchestrator = createDefaultOrchestrator();
  const rawArticles = await orchestrator.fetchAll(topKeywords);

  // 5. Get read articles for scoring penalty
  const interactions = await getUserInteractions(userId);
  const readIds = new Set(
    interactions.filter((i) => i.isRead).map((i) => i.articleId)
  );

  // 6. Score articles
  let scored = scoreArticles(rawArticles, profile.keywords, readIds);

  // 7. Fallback: If no articles meet the threshold, return the raw articles sorted by date
  // This ensures the feed is NEVER empty if the API returned anything.
  if (scored.length === 0 && rawArticles.length > 0) {
    console.warn(`[NewsPipeline] No articles met threshold for user ${userId}, using raw articles fallback.`);
    scored = rawArticles.slice(0, 20).map((a): ScoredArticle => ({
      ...a,
      relevanceScore: 5,
      matchedKeywords: [],
      isUrgent: false,
    }));
  }

  return { articles: scored, profileContext };
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Get the feed for a user. Uses cached data if valid,
 * otherwise runs the full fetch→score pipeline.
 */
export async function getOrFetchFeed(userId: string): Promise<{
  articles: ScoredArticle[];
  fetchedAt: string;
  expiresAt: string;
  cooldownEndsAt?: string;
  profileContext?: ProfileContext;
}> {
  const cached = await getCachedArticles(userId);

  if (cached) {
    const expiresAt =
      cached.expires_at instanceof Date
        ? cached.expires_at
        : new Date(cached.expires_at);

    if (expiresAt.getTime() > Date.now()) {
      // Cache is valid
      const fetchedAt =
        cached.fetched_at instanceof Date
          ? cached.fetched_at.toISOString()
          : String(cached.fetched_at);

      let cooldownEndsAt: string | undefined;
      if (cached.last_manual_refresh) {
        const lastRefresh =
          cached.last_manual_refresh instanceof Date
            ? cached.last_manual_refresh
            : new Date(String(cached.last_manual_refresh));
        const cooldownEnd = new Date(lastRefresh.getTime() + COOLDOWN_MS);
        if (cooldownEnd.getTime() > Date.now()) {
          cooldownEndsAt = cooldownEnd.toISOString();
        }
      }

      return {
        articles: cached.articles as unknown as ScoredArticle[],
        fetchedAt,
        expiresAt: expiresAt.toISOString(),
        cooldownEndsAt,
        profileContext: cached.profile_context as any || undefined,
      };
    }
  }

  // Cache miss or expired → run pipeline
  const { articles, profileContext } = await runFullPipeline(userId);
  const { fetchedAt, expiresAt } = await writeCachedArticles(
    userId,
    articles,
    false,
    profileContext
  );

  return { articles, fetchedAt, expiresAt, profileContext };
}

/**
 * Force-refresh the feed. Returns error string if on cooldown.
 */
export async function forceRefreshFeed(
  userId: string
): Promise<
  | { articles: ScoredArticle[]; fetchedAt: string; expiresAt: string; profileContext?: ProfileContext }
  | { error: string; cooldownEndsAt: string }
> {
  const cached = await getCachedArticles(userId);

  if (cached?.lastManualRefresh) {
    const lastRefresh =
      cached.lastManualRefresh instanceof Date
        ? cached.lastManualRefresh
        : new Date(String(cached.lastManualRefresh));
    const cooldownEnd = new Date(lastRefresh.getTime() + COOLDOWN_MS);

    if (cooldownEnd.getTime() > Date.now()) {
      return {
        error: "Refresh cooldown active. Please wait.",
        cooldownEndsAt: cooldownEnd.toISOString(),
      };
    }
  }

  const { articles, profileContext } = await runFullPipeline(userId);
  const { fetchedAt, expiresAt } = await writeCachedArticles(
    userId,
    articles,
    true,
    profileContext
  );

  return { articles, fetchedAt, expiresAt, profileContext };
}

/**
 * Build the full FeedResponse (with interactions merged) for the API.
 */
export async function buildFeedResponse(userId: string): Promise<FeedResponse> {
  const { articles, fetchedAt, expiresAt, cooldownEndsAt, profileContext } =
    await getOrFetchFeed(userId);
  const interactions = await getUserInteractions(userId);
  const interactionMap = new Map(
    interactions.map((i) => [i.articleId, i])
  );

  const feedArticles: FeedArticle[] = articles.map((a) => {
    const interaction = interactionMap.get(a.id);
    const type = a.isUrgent ? "alert" : isOpportunityArticle(a) ? "opportunity" : "regular";
    return {
      ...a,
      isRead: interaction?.isRead ?? false,
      isBookmarked: interaction?.isBookmarked ?? false,
      type,
    };
  });

  const urgentAlerts = feedArticles.filter((a) => a.type === "alert");
  const opportunities = feedArticles.filter((a) => a.type === "opportunity");
  const regularFeed = feedArticles.filter((a) => a.type === "regular");

  return {
    urgentAlerts,
    opportunities,
    regularFeed,
    lastUpdated: fetchedAt,
    cacheExpiresAt: expiresAt,
    cooldownEndsAt,
    profileContext,
  };
}
