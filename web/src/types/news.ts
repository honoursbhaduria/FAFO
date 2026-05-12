// ============================================================
// Smart News & Opportunity Feed — TypeScript Interfaces
// ============================================================

/** A single weighted keyword produced by the profile builder */
export interface WeightedKeyword {
  term: string;
  weight: number;
}

/** Compiled keyword profile for a user, derived from their questionnaire answers */
export interface UserKeywordProfile {
  userId: string;
  keywords: WeightedKeyword[];
  rawAnswers: Record<string, string>;
  sectorLabel: string;   // Human-readable sector name for UI display
  builtAt: string;       // ISO timestamp
}

/** Shape of a single entry in keyword-expansions.json */
export interface KeywordExpansionEntry {
  keywords: string[];
  weight_multiplier: number;
}

/** The full keyword-expansions map (JSON file root type) */
export type KeywordExpansionsMap = Record<string, KeywordExpansionEntry>;

// ────────────────────────────────────────────────────────────
// News Fetcher
// ────────────────────────────────────────────────────────────

/** Normalised article straight from a news source, before scoring */
export interface RawArticle {
  id: string;            // SHA-256 hash of URL
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;   // ISO timestamp
  imageUrl?: string;
}

/** Contract every news source adapter must satisfy */
export interface NewsSource {
  name: string;
  fetch(keywords: string[]): Promise<RawArticle[]>;
}

// ────────────────────────────────────────────────────────────
// Scorer
// ────────────────────────────────────────────────────────────

/** An article after relevance scoring */
export interface ScoredArticle extends RawArticle {
  relevanceScore: number;
  matchedKeywords: string[];
  isUrgent: boolean;
  urgencyReason?: string;
}

// ────────────────────────────────────────────────────────────
// User Interactions (read / bookmark)
// ────────────────────────────────────────────────────────────

export interface ArticleInteraction {
  articleId: string;
  isRead: boolean;
  isBookmarked: boolean;
  readAt?: string;
  bookmarkedAt?: string;
}

// ────────────────────────────────────────────────────────────
// Profile context — tells the UI what the feed is personalized for
// ────────────────────────────────────────────────────────────

export interface ProfileContext {
  sector: string;
  state: string;
  stage: string;
  topKeywords: string[];
}

// ────────────────────────────────────────────────────────────
// API response shapes
// ────────────────────────────────────────────────────────────

/** Article with interaction state merged in, ready for the UI */
export interface FeedArticle extends ScoredArticle {
  isRead: boolean;
  isBookmarked: boolean;
  type: "alert" | "opportunity" | "regular";
}

/** Full feed response from GET /api/news/feed */
export interface FeedResponse {
  urgentAlerts: FeedArticle[];
  opportunities: FeedArticle[];
  regularFeed: FeedArticle[];
  lastUpdated: string;       // ISO timestamp
  cacheExpiresAt: string;    // ISO timestamp
  cooldownEndsAt?: string;   // ISO timestamp — present when user in cooldown
  profileContext?: ProfileContext; // Sector/state/keywords the feed is tuned for
}

/** Response from POST /api/news/refresh */
export interface RefreshResponse extends FeedResponse {
  refreshedAt: string;
}

/** Relevance label buckets for UI badges */
export type RelevanceLevel = "Low" | "Medium" | "High" | "Very High";

/** Map a numeric score to a relevance label */
export function getRelevanceLevel(score: number): RelevanceLevel {
  if (score >= 50) return "Very High";
  if (score >= 30) return "High";
  if (score >= 20) return "Medium";
  return "Low";
}

/** Filter/sort options available on the client-side feed */
export type FeedFilter = "all" | "alerts" | "opportunities" | "bookmarked" | "unread";
export type FeedSort = "relevance" | "newest" | "oldest";
