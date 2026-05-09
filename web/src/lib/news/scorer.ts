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

// ────────────────────────────────────────────────────────────
// Recency scoring
// ────────────────────────────────────────────────────────────

function recencyScore(publishedAt: string): number {
  const now = Date.now();
  const pubDate = new Date(publishedAt).getTime();
  const daysSince = (now - pubDate) / (1000 * 60 * 60 * 24);

  if (daysSince <= 1) return 10;
  if (daysSince <= 2) return 7;
  if (daysSince <= 4) return 4;
  if (daysSince <= 7) return 1;
  return 0;
}

// ────────────────────────────────────────────────────────────
// Keyword matching helpers
// ────────────────────────────────────────────────────────────

function countExactMatches(text: string, term: string): number {
  const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
  return (text.match(regex) || []).length;
}

function countPartialMatches(text: string, term: string): number {
  // Stem-like partial: check if the term (length >= 4) appears as a substring
  if (term.length < 4) return 0;
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
  const combined = `${title} ${description}`.toLowerCase();
  for (const keyword of urgencyKeywords as string[]) {
    if (combined.includes(keyword.toLowerCase())) {
      return { isUrgent: true, reason: `Contains "${keyword}"` };
    }
  }
  return { isUrgent: false };
}

// ────────────────────────────────────────────────────────────
// Opportunity detection
// ────────────────────────────────────────────────────────────

export function isOpportunityArticle(article: RawArticle | ScoredArticle): boolean {
  const combined =
    `${article.title} ${article.description} ${article.content}`.toLowerCase();
  return OPPORTUNITY_KEYWORDS.some((kw) => combined.includes(kw));
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
 * Only articles with SCORE >= 10 are included.
 */
export function scoreArticles(
  articles: RawArticle[],
  keywords: WeightedKeyword[],
  readArticleIds: Set<string> = new Set()
): ScoredArticle[] {
  const THRESHOLD = 10;
  const scored: ScoredArticle[] = [];

  for (const article of articles) {
    let score = 0;
    const matchedKeywords: string[] = [];
    const fullText = `${article.title} ${article.description} ${article.content}`;

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
