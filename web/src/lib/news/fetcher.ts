// ============================================================
// News Fetcher — Adapter Pattern with Orchestrator
// ============================================================

import type { RawArticle, NewsSource, WeightedKeyword } from "@/types/news";
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
// Sector-specific query templates for India-focused news
// ────────────────────────────────────────────────────────────

const SECTOR_QUERY_TEMPLATES: Record<string, string[]> = {
  "IT/Software": [
    "India technology startup policy regulation",
    "India cybersecurity digital transformation DPIIT",
    "India IT software MSME scheme funding",
  ],
  "Manufacturing": [
    "India manufacturing PLI scheme industrial production",
    "Make in India factory MSME manufacturing policy",
    "India manufacturing export quality compliance",
  ],
  "Food & Beverage": [
    "India FSSAI food safety regulation compliance",
    "India food industry market trends processing",
    "India food beverage MSME scheme subsidy",
  ],
  "Agriculture": [
    "India agriculture farming PM-KISAN MSP policy",
    "India agri business horticulture dairy scheme",
    "India agriculture subsidy crop insurance irrigation",
  ],
  "Healthcare": [
    "India healthcare pharma medical regulation policy",
    "India Ayushman Bharat health scheme hospital",
    "India health tech telemedicine medical devices",
  ],
  "Retail/Trading": [
    "India retail e-commerce ONDC marketplace policy",
    "India GST retail business compliance trading",
    "India D2C consumer market FMCG",
  ],
  "Education": [
    "India education NEP 2020 EdTech policy",
    "India skill development NSDC PMKVY training",
    "India education startup scheme funding",
  ],
  "Textile": [
    "India textile handloom garment khadi policy",
    "India textile PLI scheme export weaving",
    "India fashion apparel manufacturing MSME",
  ],
  "Construction": [
    "India construction real estate PMAY infrastructure",
    "India smart cities housing scheme policy",
    "India construction MSME building material",
  ],
  "Transport": [
    "India transport logistics fleet warehousing",
    "India EV electric vehicle policy scheme",
    "India shipping freight cold chain supply",
  ],
  "Service": [
    "India service sector consulting BPO policy",
    "India professional services MSME scheme",
    "India outsourcing digital services business",
  ],
  "Handicraft": [
    "India handicraft artisan GI tag craft policy",
    "India handmade traditional art export scheme",
  ],
  "Renewable Energy": [
    "India solar renewable energy green policy scheme",
    "India EV electric vehicle clean energy subsidy",
  ],
  "Tourism & Hospitality": [
    "India tourism hospitality hotel travel policy",
    "India eco-tourism heritage resort scheme",
  ],
};

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

  /** Perform a single NewsAPI fetch for a given query string */
  private async fetchQuery(query: string, pageSize: number = 40): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Date range: last 7 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const from = fromDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("from", from);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", String(pageSize));
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

  async fetch(keywords: string[]): Promise<RawArticle[]> {
    if (!this.apiKey) return [];

    // Separate sector keyword from others for smarter query construction
    const topKeywords = keywords.slice(0, 8);

    // Detect sector from keywords to use sector-specific query templates
    const detectedSector = this.detectSector(topKeywords);

    // Build queries
    const queries: { query: string; pageSize: number }[] = [];

    // 1. Primary query: sector keywords combined with India focus
    const primaryQuery = `(${topKeywords.slice(0, 5).join(" OR ")}) AND (India OR Indian OR MSME OR government)`;
    queries.push({ query: primaryQuery, pageSize: 30 });

    // 2. Sector-specific queries (if sector detected)
    if (detectedSector && SECTOR_QUERY_TEMPLATES[detectedSector]) {
      const sectorQueries = SECTOR_QUERY_TEMPLATES[detectedSector];
      // Use the first 2 sector-specific queries
      for (const sq of sectorQueries.slice(0, 2)) {
        queries.push({ query: sq, pageSize: 20 });
      }
    }

    // 3. State-specific query (if state keyword found)
    const stateKeyword = topKeywords.find((kw) =>
      INDIA_INDICATORS.some((ind) => kw.toLowerCase() === ind && ind.length > 4)
    );
    if (stateKeyword) {
      queries.push({
        query: `${stateKeyword} business MSME policy scheme`,
        pageSize: 15,
      });
    }

    // 4. Goal-specific query (detect funding/subsidy/export keywords)
    const goalKeywords = topKeywords.filter((kw) =>
      ["funding", "subsidy", "grant", "loan", "export", "tax", "skill", "technology"].some(
        (g) => kw.toLowerCase().includes(g)
      )
    );
    if (goalKeywords.length > 0) {
      queries.push({
        query: `India ${goalKeywords.slice(0, 3).join(" ")} MSME scheme`,
        pageSize: 15,
      });
    }

    // Execute all queries in parallel
    const allResults = await Promise.allSettled(
      queries.map((q) => this.fetchQuery(q.query, q.pageSize))
    );

    const allArticles: RawArticle[] = [];
    for (const result of allResults) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    }

    // Filter to India-relevant articles only
    const indiaFiltered = allArticles.filter(isIndiaRelevant);

    // If we got enough India-relevant articles, return them
    if (indiaFiltered.length >= 10) {
      return indiaFiltered;
    }

    // Fallback: also fetch with explicit India business terms
    const fallbackQuery = `India ${topKeywords.slice(0, 3).join(" ")} business policy regulation`;
    const fallbackArticles = await this.fetchQuery(fallbackQuery, 30);

    // Combine and deduplicate
    const combined = [...indiaFiltered, ...fallbackArticles.filter(isIndiaRelevant)];
    return combined;
  }

  /** Detect the user's sector from their keyword list */
  private detectSector(keywords: string[]): string | null {
    const keywordStr = keywords.join(" ").toLowerCase();
    const sectorScores: { sector: string; score: number }[] = [];

    for (const [sector, queries] of Object.entries(SECTOR_QUERY_TEMPLATES)) {
      const sectorTerms = queries.join(" ").toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (sectorTerms.includes(kw.toLowerCase())) score++;
      }
      if (score > 0) sectorScores.push({ sector, score });
    }

    // Also check direct sector name matches
    for (const sector of Object.keys(SECTOR_QUERY_TEMPLATES)) {
      if (keywordStr.includes(sector.toLowerCase())) {
        return sector;
      }
    }

    sectorScores.sort((a, b) => b.score - a.score);
    return sectorScores[0]?.sector || null;
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
