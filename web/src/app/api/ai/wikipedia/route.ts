import { NextResponse } from "next/server";

interface WikiSearchResult {
  title: string;
  pageid: number;
  snippet: string;
}

interface SchemeResult {
  title: string;
  summary: string;
  url: string;
  category: string;
}

// Category detection based on keywords in title/summary
function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  const categories: Record<string, string[]> = {
    "Agriculture": ["agriculture", "farm", "kisan", "crop", "irrigation", "soil", "rural development"],
    "Education": ["education", "scholarship", "school", "student", "vidya", "shiksha", "literacy"],
    "Healthcare": ["health", "medical", "ayushman", "hospital", "swasthya", "insurance", "treatment"],
    "Finance & Banking": ["finance", "loan", "credit", "bank", "mudra", "subsidy", "insurance", "pension"],
    "Women & Child": ["women", "girl", "child", "mahila", "beti", "maternity", "sukanya"],
    "Housing": ["housing", "awas", "home", "shelter", "pradhan mantri awas"],
    "Employment": ["employment", "skill", "job", "rozgar", "kaushal", "training", "livelihood"],
    "Digital India": ["digital", "technology", "internet", "broadband", "e-governance"],
    "Infrastructure": ["infrastructure", "road", "highway", "smart city", "urban", "swachh"],
    "MSME": ["msme", "enterprise", "startup", "udyam", "business", "entrepreneur", "industry"],
    "Energy": ["solar", "energy", "electricity", "power", "ujjwala", "gas", "renewable"],
    "Social Welfare": ["welfare", "pension", "ration", "food security", "poverty", "jan dhan"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return "Government Scheme";
}

async function searchWikipedia(query: string): Promise<WikiSearchResult[]> {
  const searchQuery = `${query} government scheme India`;
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=8&format=json&origin=*`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Wikipedia search failed");

  const data = await res.json();
  return data.query?.search || [];
}

async function getPageExtract(pageId: number): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&exsentences=4&format=json&origin=*`;

  const res = await fetch(url);
  if (!res.ok) return "";

  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return "";

  const page = pages[String(pageId)];
  return page?.extract || "";
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchResults = await searchWikipedia(query);

    // Fetch extracts for all results in parallel
    const schemes: SchemeResult[] = await Promise.all(
      searchResults.map(async (result) => {
        const summary = await getPageExtract(result.pageid);
        return {
          title: result.title,
          summary: summary || result.snippet.replace(/<[^>]*>/g, ""), // strip HTML from snippet
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, "_"))}`,
          category: detectCategory(result.title, summary || result.snippet),
        };
      })
    );

    // Filter for India-related results
    const indiaSchemes = schemes.filter((s) => {
      const text = `${s.title} ${s.summary}`.toLowerCase();
      return (
        text.includes("india") ||
        text.includes("pradhan mantri") ||
        text.includes("bharat") ||
        text.includes("government of india") ||
        text.includes("ministry") ||
        text.includes("rupee") ||
        text.includes("crore") ||
        text.includes("lakh") ||
        text.includes("modi") ||
        text.includes("state government") ||
        text.includes("central government") ||
        text.includes("indian") ||
        text.includes("scheme") ||
        text.includes("yojana") ||
        text.includes("abhiyan") ||
        text.includes("mission")
      );
    });

    return NextResponse.json({ schemes: indiaSchemes.length > 0 ? indiaSchemes : schemes.slice(0, 6) });
  } catch (error) {
    console.error("Wikipedia API Error:", error);
    return NextResponse.json({ error: "Failed to search Wikipedia" }, { status: 500 });
  }
}
