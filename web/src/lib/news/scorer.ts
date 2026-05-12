// ============================================================
// Relevance Scoring Engine — Pure TypeScript, no external calls
// ============================================================

import type { RawArticle, ScoredArticle, WeightedKeyword } from "@/types/news";
import urgencyKeywords from "@/data/urgency-keywords.json";

/** Opportunity-detection keywords */
const OPPORTUNITY_KEYWORDS = [
  "tender",
  "grant",
  "subsidy",
  "scheme",
  "application open",
  "apply now",
  "last date to apply",
  "funding available",
  "registration open",
  "incentive",
  "rebate",
  "concession",
];

// Pre-compiled urgency regex
const URGENCY_REGEX = new RegExp(
  (urgencyKeywords as string[]).map(kw => escapeRegex(kw)).join("|"),
  "gi"
);

// Pre-compiled opportunity regex
const OPPORTUNITY_REGEX = new RegExp(
  OPPORTUNITY_KEYWORDS.map(kw => escapeRegex(kw)).join("|"),
  "gi"
);

// ────────────────────────────────────────────────────────────
// Recency scoring
// ────────────────────────────────────────────────────────────

function recencyScore(publishedAt: string): number {
  const now = Date.now();
  const pubDate = new Date(publishedAt).getTime();
  const daysSince = (now - pubDate) / (1000 * 60 * 60 * 24);

  if (daysSince <= 1) return 10;
  if (daysSince <= 2) return 8;
  if (daysSince <= 4) return 5;
  if (daysSince <= 7) return 2;
  return 1; // Always give at least 1 point for recency
}

// ────────────────────────────────────────────────────────────
// Keyword matching helpers
// ────────────────────────────────────────────────────────────

// Cache for keyword regexes to avoid re-compiling in loops
const keywordRegexCache = new Map<string, RegExp>();

function getKeywordRegex(term: string): RegExp {
  let regex = keywordRegexCache.get(term);
  if (!regex) {
    regex = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
    keywordRegexCache.set(term, regex);
  }
  return regex;
}

function countExactMatches(text: string, term: string): number {
  if (!text || !term) return 0;
  const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
  return (text.match(regex) || []).length;
}

function countPartialMatches(text: string, term: string): number {
  if (!text || !term || term.length < 4) return 0;
  const lower = text.toLowerCase();
  const termLower = term.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = lower.indexOf(termLower, pos)) !== -1) {
    count++;
    pos += termLower.length;
  }
  // Subtract exact matches to avoid double-counting
  const exact = countExactMatches(text, term);
  return Math.max(0, count - exact);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ────────────────────────────────────────────────────────────
// Urgency detection
// ────────────────────────────────────────────────────────────

function detectUrgency(
  title: string,
  description: string
): { isUrgent: boolean; reason?: string } {
  const combined = `${title} ${description}`;
  const match = combined.match(URGENCY_REGEX);
  if (match) {
    return { isUrgent: true, reason: `Contains "${match[0]}"` };
  }
  return { isUrgent: false };
}

// ────────────────────────────────────────────────────────────
// Opportunity detection
// ────────────────────────────────────────────────────────────

export function isOpportunityArticle(article: RawArticle | ScoredArticle): boolean {
  const combined =
    `${article.title} ${article.description} ${article.content}`;
  return OPPORTUNITY_REGEX.test(combined);
}

// ────────────────────────────────────────────────────────────
// Main scoring function
// ────────────────────────────────────────────────────────────

/**
 * Score a list of raw articles against the user's keyword profile.
 *
 * Formula per article:
 *   SCORE =
 *     (exact_keyword_matches × keyword_weight × 3)
 *   + (partial_keyword_matches × keyword_weight × 1)
 *   + (title_match_bonus × 5)
 *   + (description_match_bonus × 2)
 *   + recency_score
 *   - (read_penalty if article was already read)
 *
 * Threshold lowered to 5 to ensure more articles reach the feed.
 */
export function scoreArticles(
  articles: RawArticle[],
  keywords: WeightedKeyword[],
  readArticleIds: Set<string> = new Set()
): ScoredArticle[] {
  const THRESHOLD = 5;
  const scored: ScoredArticle[] = [];

  for (const article of articles) {
    let score = 0;
    const matchedKeywords: string[] = [];
    const fullText = `${article.title} ${article.description} ${article.content}`;

    // Base score for simply being fetched
    score += 2;

    for (const { term, weight } of keywords) {
      const exact = countExactMatches(fullText, term);
      const partial = countPartialMatches(fullText, term);

      if (exact === 0 && partial === 0) continue;

      matchedKeywords.push(term);

      // Core matches
      score += exact * weight * 3;
      score += partial * weight * 1;

      // Title bonus
      if (countExactMatches(article.title, term) > 0) {
        score += 5;
      }

      // Description bonus
      if (countExactMatches(article.description, term) > 0) {
        score += 2;
      }
    }

    // Recency
    score += recencyScore(article.publishedAt);

    // Read penalty
    if (readArticleIds.has(article.id)) {
      score -= 5;
    }

    if (score < THRESHOLD) continue;

    // Urgency
    const { isUrgent, reason } = detectUrgency(
      article.title,
      article.description
    );

    scored.push({
      ...article,
      relevanceScore: Math.round(score),
      matchedKeywords: [...new Set(matchedKeywords)],
      isUrgent,
      urgencyReason: reason,
    });
  }

  // Sort by relevance score descending
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored;
}
