// ============================================================
// News Fetcher — Adapter Pattern with Orchestrator
// ============================================================

import type { RawArticle, NewsSource } from "@/types/news";
import crypto from "crypto";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Produce a deterministic ID from a URL */
function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

/** Compute word-overlap ratio between two pre-calculated word sets */
function calculateSimilarity(wordsA: Set<string>, wordsB: Set<string>): number {
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

/** Internal helper for tokenization */
function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/\s+/).filter(Boolean));
}

// ────────────────────────────────────────────────────────────
// NewsAPI Adapter
// ────────────────────────────────────────────────────────────

export class NewsAPIAdapter implements NewsSource {
  name = "NewsAPI";

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || "";
    if (!this.apiKey) {
      console.warn("[NewsAPIAdapter] NEWSAPI_KEY is not set.");
    }
  }

  async fetch(keywords: string[]): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Build query from top keywords (pick top 5 to keep the query focused)
    const topKeywords = keywords.slice(0, 5);
    const query = topKeywords.join(" OR ");

    // Date range: last 7 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const from = fromDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("from", from);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("apiKey", this.apiKey);

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 0 } });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[NewsAPIAdapter] API error ${res.status}: ${body}`);
        return [];
      }

      const data = await res.json();

      if (!data.articles || !Array.isArray(data.articles)) return [];

      return data.articles
        .filter((a: any) => a.title && a.url && a.title !== "[Removed]")
        .map((a: any): RawArticle => ({
          id: hashUrl(a.url),
          title: a.title || "",
          description: a.description || "",
          content: a.content || "",
          url: a.url,
          source: a.source?.name || "Unknown",
          publishedAt: a.publishedAt || new Date().toISOString(),
          imageUrl: a.urlToImage || undefined,
        }));
    } catch (err) {
      console.error("[NewsAPIAdapter] Fetch failed:", err);
      return [];
    }
  }
}

// ────────────────────────────────────────────────────────────
// Fetcher Orchestrator
// ────────────────────────────────────────────────────────────

export class FetcherOrchestrator {
  private adapters: NewsSource[];

  constructor(adapters: NewsSource[]) {
    this.adapters = adapters;
  }

  /** Fetch from all sources in parallel, merge & deduplicate */
  async fetchAll(keywords: string[]): Promise<RawArticle[]> {
    const results = await Promise.allSettled(
      this.adapters.map((adapter) => adapter.fetch(keywords))
    );

    const allArticles: RawArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      } else {
        console.error("[FetcherOrchestrator] Adapter error:", result.reason);
      }
    }

    return this.deduplicate(allArticles);
  }

  /** Remove duplicates by exact URL match or 70%+ title similarity */
  private deduplicate(articles: RawArticle[]): RawArticle[] {
    const unique: RawArticle[] = [];
    const seenUrls = new Set<string>();
    const uniqueTokenSets: Set<string>[] = [];

    for (const article of articles) {
      // Skip exact URL duplicates
      if (seenUrls.has(article.url)) continue;

      // Tokenize current article title once
      const currentTokens = tokenize(article.title);

      // Skip near-duplicate titles using pre-tokenized sets
      let isDuplicate = false;
      for (const existingTokens of uniqueTokenSets) {
        if (calculateSimilarity(existingTokens, currentTokens) >= 0.7) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) continue;

      seenUrls.add(article.url);
      unique.push(article);
      uniqueTokenSets.push(currentTokens);
    }

    return unique;
  }
}

// ────────────────────────────────────────────────────────────
// Default instance with only NewsAPI active
// ────────────────────────────────────────────────────────────

export function createDefaultOrchestrator(): FetcherOrchestrator {
  return new FetcherOrchestrator([new NewsAPIAdapter()]);
}
