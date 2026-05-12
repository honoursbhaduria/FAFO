// ============================================================
// News Fetcher — Adapter Pattern with Orchestrator
// ============================================================

import type { RawArticle, NewsSource, WeightedKeyword } from "@/types/news";
import crypto from "crypto";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Produce a deterministic ID from a URL or other unique string */
function safeHash(input: string): string {
  if (!input) return Math.random().toString(36).slice(2, 10);
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/** Compute word-overlap ratio between two strings */
function titleSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
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
// India-relevance keywords for filtering
// ────────────────────────────────────────────────────────────

const INDIA_INDICATORS = [
  "india", "indian", "bharat", "delhi", "mumbai", "bangalore", "bengaluru",
  "chennai", "kolkata", "hyderabad", "pune", "ahmedabad", "jaipur", "lucknow",
  "msme", "udyam", "gst", "sebi", "rbi", "niti aayog", "make in india",
  "startup india", "digital india", "mudra", "stand up india", "pm-kisan",
  "fssai", "ayushman", "pmay", "nrega", "pli scheme", "ministry", "govt",
  "government of india", "central government", "state government", "gazette",
  "crore", "lakh", "rupee", "inr", "₹", "cbdt", "cbic", "epfo",
  "maharashtra", "karnataka", "tamil nadu", "uttar pradesh", "gujarat",
  "rajasthan", "west bengal", "telangana", "kerala", "madhya pradesh",
  "bihar", "punjab", "haryana", "odisha", "assam", "jharkhand",
  "chhattisgarh", "uttarakhand", "himachal", "andhra pradesh", "goa",
  "noida", "gurgaon", "gurugram", "surat", "vadodara", "chandigarh",
  "bhubaneswar", "patna", "ranchi", "bhopal", "indore", "coimbatore",
  "dpiit", "nabard", "sidbi", "nsdc", "pmkvy", "npci", "uidai",
  "aadhaar", "pan card", "gstr", "tds", "itr",
];

/** Check if article text has India-relevant content */
export function isIndiaRelevant(article: RawArticle): boolean {
  const text = `${article.title} ${article.description} ${article.source}`.toLowerCase();
  return INDIA_INDICATORS.some((indicator) => text.includes(indicator));
}

// ────────────────────────────────────────────────────────────
// NewsData.io Adapter
// ────────────────────────────────────────────────────────────

export class NewsDataIOAdapter implements NewsSource {
  name = "NewsDataIO";
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEWSDATA_KEY || "";
    this.apiUrl = process.env.NEWSDATA_URL || "https://newsdata.io/api/1/latest";
  }

  async fetch(keywords: string[]): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Use a multi-stage approach for NewsDataIO because of its strict 48h limit
    // 1. Specific keywords (first 3)
    // 2. If nothing, broader industry terms
    // 3. If nothing, general India business news

    const attemptFetch = async (q: string): Promise<RawArticle[]> => {
      const url = new URL(this.apiUrl);
      url.searchParams.set("apikey", this.apiKey);
      url.searchParams.set("q", q);
      url.searchParams.set("language", "en");
      url.searchParams.set("country", "in");

      try {
        const res = await fetch(url.toString(), { next: { revalidate: 0 } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.results || !Array.isArray(data.results)) return [];
        return data.results.map((a: any): RawArticle => ({
          id: safeHash(a.link || a.article_id || a.title),
          title: a.title || "No Title",
          description: a.description || "",
          content: a.content || a.description || "",
          url: a.link || "#",
          source: a.source_id || "Unknown",
          publishedAt: a.pubDate || new Date().toISOString(),
          imageUrl: a.image_url || undefined,
        }));
      } catch {
        return [];
      }
    };

    // Stage 1: Specific
    const q1 = keywords.slice(0, 3).join(" OR ");
    let results = await attemptFetch(q1);
    if (results.length > 0) return results;

    // Stage 2: Broader (just the top keyword + business)
    if (keywords.length > 0) {
      const q2 = `${keywords[0]} business`;
      results = await attemptFetch(q2);
      if (results.length > 0) return results;
    }

    // Stage 3: General Fallback
    return attemptFetch("India business news");
  }
}

// ────────────────────────────────────────────────────────────
// Mediastack Adapter
// ────────────────────────────────────────────────────────────

export class MediastackAdapter implements NewsSource {
  name = "Mediastack";
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.MEDIASTACK_KEY || "";
    this.apiUrl = process.env.MEDIASTACK_URL || "http://api.mediastack.com/v1/news";
  }

  async fetch(keywords: string[]): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Mediastack OR logic uses commas
    const attemptFetch = async (kw: string): Promise<RawArticle[]> => {
      const url = new URL(this.apiUrl);
      url.searchParams.set("access_key", this.apiKey);
      url.searchParams.set("keywords", kw);
      url.searchParams.set("languages", "en");
      url.searchParams.set("countries", "in");
      url.searchParams.set("limit", "25");

      try {
        const res = await fetch(url.toString(), { next: { revalidate: 0 } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.data || !Array.isArray(data.data)) return [];
        return data.data.map((a: any): RawArticle => ({
          id: safeHash(a.url || a.title),
          title: a.title || "No Title",
          description: a.description || "",
          content: a.description || "", 
          url: a.url || "#",
          source: a.source || "Unknown",
          publishedAt: a.published_at || new Date().toISOString(),
          imageUrl: a.image || undefined,
        }));
      } catch {
        return [];
      }
    };

    // Stage 1: Comma separated keywords
    const kw1 = keywords.slice(0, 5).join(",");
    let results = await attemptFetch(kw1);
    if (results.length > 0) return results;

    // Stage 2: Top keyword
    if (keywords.length > 0) {
      results = await attemptFetch(keywords[0]);
      if (results.length > 0) return results;
    }

    // Stage 3: General
    return attemptFetch("business,economy,startup");
  }
}

// ────────────────────────────────────────────────────────────
// NewsAPI Adapter
// ────────────────────────────────────────────────────────────

export class NewsAPIAdapter implements NewsSource {
  name = "NewsAPI";
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || "";
    this.apiUrl = process.env.NEWSAPI_URL || "https://newsapi.org/v2/everything";
  }

  private async fetchQuery(query: string, pageSize: number = 40): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 14); // 14 days for more results
    const from = fromDate.toISOString().split("T")[0];

    const url = new URL(this.apiUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("from", from);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", String(pageSize));
    url.searchParams.set("apiKey", this.apiKey);

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.articles || !Array.isArray(data.articles)) return [];
      return data.articles
        .filter((a: any) => a.title && a.url && a.title !== "[Removed]")
        .map((a: any): RawArticle => ({
          id: safeHash(a.url),
          title: a.title || "",
          description: a.description || "",
          content: a.content || "",
          url: a.url,
          source: a.source?.name || "Unknown",
          publishedAt: a.publishedAt || new Date().toISOString(),
          imageUrl: a.urlToImage || undefined,
        }));
    } catch {
      return [];
    }
  }

  async fetch(keywords: string[]): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Simplify query for reliability
    const q = keywords.length > 0 
      ? `(${keywords.slice(0, 3).join(" OR ")}) AND (India OR Indian OR MSME)`
      : "India business MSME";

    const articles = await this.fetchQuery(q, 50);
    return articles.filter(isIndiaRelevant);
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

  async fetchAll(keywords: string[]): Promise<RawArticle[]> {
    const results = await Promise.allSettled(
      this.adapters.map((adapter) => adapter.fetch(keywords))
    );

    const allArticles: RawArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    }

    return this.deduplicate(allArticles);
  }

  private deduplicate(articles: RawArticle[]): RawArticle[] {
    const unique: RawArticle[] = [];
    const seenUrls = new Set<string>();

    for (const article of articles) {
      if (!article.url || article.url === "#") {
        const isDuplicate = unique.some(
          (existing) => titleSimilarity(existing.title, article.title) >= 0.7
        );
        if (isDuplicate) continue;
        unique.push(article);
        continue;
      }

      if (seenUrls.has(article.url)) continue;

      const isDuplicate = unique.some(
        (existing) => titleSimilarity(existing.title, article.title) >= 0.7
      );
      if (isDuplicate) continue;

      seenUrls.add(article.url);
      unique.push(article);
    }

    return unique;
  }
}

export function createDefaultOrchestrator(): FetcherOrchestrator {
  return new FetcherOrchestrator([
    new NewsDataIOAdapter(),
    new MediastackAdapter(),
    new NewsAPIAdapter(),
  ]);
}
