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
} from "@/types/news";

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// ────────────────────────────────────────────────────────────
// DB table bootstrap (called lazily on first use)
// ────────────────────────────────────────────────────────────

let tablesEnsured = false;

async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS user_news_cache (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        articles JSONB NOT NULL DEFAULT '[]',
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        last_manual_refresh TIMESTAMPTZ,
        profile_context JSONB,
        UNIQUE(user_id)
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS user_news_interactions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        article_id TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
        read_at TIMESTAMPTZ,
        bookmarked_at TIMESTAMPTZ,
        UNIQUE(user_id, article_id)
      );
    `);
    // Ensure profile_context column exists (migration-safe)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE user_news_cache ADD COLUMN IF NOT EXISTS profile_context JSONB;
      `);
    } catch {
      // Column may already exist
    }
    tablesEnsured = true;
  } catch (err) {
    console.error("[Cache] Error ensuring tables:", err);
  }
}

// ────────────────────────────────────────────────────────────
// Interaction helpers
// ────────────────────────────────────────────────────────────

export async function getUserInteractions(
  userId: string
): Promise<ArticleInteraction[]> {
  await ensureTables();
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT article_id, is_read, is_bookmarked, read_at, bookmarked_at
     FROM user_news_interactions WHERE user_id = $1`,
    userId
  );
  return rows.map((r) => ({
    articleId: r.article_id,
    isRead: r.is_read,
    isBookmarked: r.is_bookmarked,
    readAt: r.read_at?.toISOString?.() || r.read_at || undefined,
    bookmarkedAt: r.bookmarked_at?.toISOString?.() || r.bookmarked_at || undefined,
  }));
}

export async function toggleBookmark(
  userId: string,
  articleId: string
): Promise<boolean> {
  await ensureTables();
  // Upsert + toggle
  await prisma.$executeRawUnsafe(
    `INSERT INTO user_news_interactions (user_id, article_id, is_bookmarked, bookmarked_at)
     VALUES ($1, $2, TRUE, NOW())
     ON CONFLICT (user_id, article_id) DO UPDATE SET
       is_bookmarked = NOT user_news_interactions.is_bookmarked,
       bookmarked_at = CASE WHEN NOT user_news_interactions.is_bookmarked THEN NOW() ELSE NULL END`,
    userId,
    articleId
  );
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT is_bookmarked FROM user_news_interactions WHERE user_id = $1 AND article_id = $2`,
    userId,
    articleId
  );
  return rows[0]?.is_bookmarked ?? false;
}

export async function markAsRead(
  userId: string,
  articleId: string
): Promise<void> {
  await ensureTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO user_news_interactions (user_id, article_id, is_read, read_at)
     VALUES ($1, $2, TRUE, NOW())
     ON CONFLICT (user_id, article_id) DO UPDATE SET
       is_read = TRUE,
       read_at = COALESCE(user_news_interactions.read_at, NOW())`,
    userId,
    articleId
  );
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
    .map((a) => ({
      ...a,
      isRead: interactionMap.get(a.id)?.isRead ?? false,
      isBookmarked: true,
    }));
}

// ────────────────────────────────────────────────────────────
// Cache invalidation (called when profile/questionnaire changes)
// ────────────────────────────────────────────────────────────

/**
 * Invalidate the cached news feed for a user.
 * Call this whenever the user's BusinessProfile or questionnaire answers change.
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await ensureTables();
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM user_news_cache WHERE user_id = $1`,
      userId
    );
    console.log(`[Cache] Invalidated news cache for user ${userId}`);
  } catch (err) {
    console.error("[Cache] Error invalidating cache:", err);
  }
}

// ────────────────────────────────────────────────────────────
// Cache read / write
// ────────────────────────────────────────────────────────────

interface CacheRow {
  articles: unknown;
  fetched_at: Date | string;
  expires_at: Date | string;
  last_manual_refresh: Date | string | null;
  profile_context: unknown;
}

async function getCachedArticles(userId: string): Promise<CacheRow | null> {
  await ensureTables();
  const rows: CacheRow[] = await prisma.$queryRawUnsafe(
    `SELECT articles, fetched_at, expires_at, last_manual_refresh, profile_context
     FROM user_news_cache WHERE user_id = $1 LIMIT 1`,
    userId
  );
  return rows[0] ?? null;
}

async function writeCachedArticles(
  userId: string,
  articles: ScoredArticle[],
  isManualRefresh: boolean,
  profileContext?: { sector: string; state: string; topKeywords: string[] }
): Promise<{ fetchedAt: string; expiresAt: string }> {
  await ensureTables();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  const manualRefreshClause = isManualRefresh
    ? ", last_manual_refresh = NOW()"
    : "";

  await prisma.$executeRawUnsafe(
    `INSERT INTO user_news_cache (user_id, articles, fetched_at, expires_at, profile_context${isManualRefresh ? ", last_manual_refresh" : ""})
     VALUES ($1, $2::jsonb, NOW(), $3, $4::jsonb${isManualRefresh ? ", NOW()" : ""})
     ON CONFLICT (user_id) DO UPDATE SET
       articles = $2::jsonb,
       fetched_at = NOW(),
       expires_at = $3,
       profile_context = $4::jsonb
       ${manualRefreshClause}`,
    userId,
    JSON.stringify(articles),
    expiresAt,
    JSON.stringify(profileContext || null)
  );

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
  profileContext: { sector: string; state: string; topKeywords: string[] };
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
  const profileContext = {
    sector: profile.sectorLabel || "General",
    state: profile.rawAnswers.state || "",
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
  const scored = scoreArticles(rawArticles, profile.keywords, readIds);

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
  profileContext?: { sector: string; state: string; topKeywords: string[] };
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
  | { articles: ScoredArticle[]; fetchedAt: string; expiresAt: string; profileContext?: { sector: string; state: string; topKeywords: string[] } }
  | { error: string; cooldownEndsAt: string }
> {
  const cached = await getCachedArticles(userId);

  if (cached?.last_manual_refresh) {
    const lastRefresh =
      cached.last_manual_refresh instanceof Date
        ? cached.last_manual_refresh
        : new Date(String(cached.last_manual_refresh));
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
    return {
      ...a,
      isRead: interaction?.isRead ?? false,
      isBookmarked: interaction?.isBookmarked ?? false,
    };
  });

  const urgentAlerts = feedArticles.filter((a) => a.isUrgent);
  const opportunities = feedArticles.filter(
    (a) => !a.isUrgent && isOpportunityArticle(a)
  );
  const regularFeed = feedArticles.filter(
    (a) => !a.isUrgent && !isOpportunityArticle(a)
  );

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

