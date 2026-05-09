// ============================================================
// Recommendation Engine — Dynamic SQL from user answers
// ============================================================

import { prisma } from "@/lib/prisma";
import type { UserAnswers, SchemeResult, RecommendationResponse } from "@/types/questionnaire";

/** Map user-facing sector values to search keywords for scheme matching */
const SECTOR_KEYWORDS: Record<string, string[]> = {
  "IT/Software": ["IT", "Software", "Technology", "Digital", "Startup", "Innovation"],
  "Manufacturing": ["Manufacturing", "Industry", "Production", "Factory", "Make in India"],
  "Food & Beverage": ["Food", "FSSAI", "Beverage", "Agriculture", "Processing"],
  "Agriculture": ["Agriculture", "Farming", "Crop", "Kisan", "Rural", "Horticulture"],
  "Healthcare": ["Health", "Medical", "Pharma", "Hospital", "Ayush", "Wellness"],
  "Retail/Trading": ["Retail", "Trade", "Commerce", "Business", "Shop"],
  "Education": ["Education", "Skill", "Training", "School", "EdTech"],
  "Textile": ["Textile", "Handloom", "Weaving", "Garment", "Khadi"],
  "Construction": ["Construction", "Housing", "Infrastructure", "Real Estate"],
  "Transport": ["Transport", "Logistics", "Fleet", "Shipping"],
  "Service": ["Service", "Consulting", "Professional", "BPO"],
};

export async function getRecommendations(
  answers: UserAnswers
): Promise<RecommendationResponse> {
  const start = Date.now();
  const filtersApplied: string[] = [];
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  const state = answers.state as string;
  const sector = answers.sector as string;
  const isWomenOwned = answers.gender === "true";
  const isScSt = answers.caste === "true";

  // --- Build dynamic WHERE conditions ---

  // 1. State filter: match beneficiaryState in raw_data JSONB or 'All'
  if (state) {
    conditions.push(`(
      raw_data->'fields'->'beneficiaryState' @> $${paramIdx}::jsonb
      OR raw_data->'fields'->'beneficiaryState' @> '["All"]'::jsonb
      OR raw_data->'fields'->'beneficiaryState' IS NULL
    )`);
    params.push(JSON.stringify([state]));
    paramIdx++;
    filtersApplied.push(`State: ${state}`);
  }

  // 2. Category / sector filter via categories JSONB or scheme_name/description text
  if (sector) {
    const keywords = SECTOR_KEYWORDS[sector] || [sector];
    const keywordConditions = keywords.map((kw) => {
      const idx = paramIdx++;
      params.push(`%${kw}%`);
      return `(
        scheme_name ILIKE $${idx}
        OR raw_data->'fields'->>'briefDescription' ILIKE $${idx}
        OR categories::text ILIKE $${idx}
        OR raw_data->'fields'->'tags'::text ILIKE $${idx}
      )`;
    });
    conditions.push(`(${keywordConditions.join(" OR ")})`);
    filtersApplied.push(`Sector: ${sector}`);
  }

  // 3. Women-owned filter
  if (isWomenOwned) {
    const idx = paramIdx++;
    params.push("%Women%");
    conditions.push(`(
      categories::text ILIKE $${idx}
      OR raw_data->'fields'->>'briefDescription' ILIKE $${idx}
      OR scheme_name ILIKE $${idx}
    )`);
    filtersApplied.push("Women-owned business");
  }

  // 4. SC/ST filter
  if (isScSt) {
    const idx = paramIdx++;
    params.push("%SC/ST%");
    const idx2 = paramIdx++;
    params.push("%Scheduled%");
    conditions.push(`(
      categories::text ILIKE $${idx}
      OR raw_data->'fields'->>'briefDescription' ILIKE $${idx}
      OR categories::text ILIKE $${idx2}
      OR raw_data->'fields'->>'briefDescription' ILIKE $${idx2}
    )`);
    filtersApplied.push("SC/ST category");
  }

  // Build the final query
  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const query = `
    SELECT api_id, scheme_name, slug, categories, raw_data
    FROM schemes
    ${whereClause}
    ORDER BY fetched_at DESC
    LIMIT 50
  `;

  let rows: any[];
  try {
    rows = await prisma.$queryRawUnsafe(query, ...params);
  } catch (err) {
    console.error("[RecommendationEngine] Query error:", err);
    // Fallback: return all schemes if query fails
    rows = await prisma.$queryRawUnsafe(
      `SELECT api_id, scheme_name, slug, categories, raw_data
       FROM schemes ORDER BY fetched_at DESC LIMIT 30`
    );
    filtersApplied.push("(Fallback: broad search)");
  }

  // --- Score and format results ---
  const schemes: SchemeResult[] = rows.map((row: any) => {
    const fields = row.raw_data?.fields || {};
    const cats: string[] = Array.isArray(row.categories) ? row.categories : [];
    const matchReasons: string[] = [];

    // Compute match reasons
    if (state) {
      const bStates = fields.beneficiaryState || [];
      if (bStates.includes(state) || bStates.includes("All")) {
        matchReasons.push(`Available in ${state}`);
      }
    }
    if (sector) {
      const keywords = SECTOR_KEYWORDS[sector] || [sector];
      const text = `${row.scheme_name} ${fields.briefDescription || ""} ${cats.join(" ")}`.toLowerCase();
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) {
          matchReasons.push(`Matches ${kw}`);
          break;
        }
      }
    }
    if (isWomenOwned && `${cats.join(" ")} ${fields.briefDescription || ""}`.toLowerCase().includes("women")) {
      matchReasons.push("Supports women entrepreneurs");
    }
    if (isScSt && `${cats.join(" ")} ${fields.briefDescription || ""}`.toLowerCase().includes("sc")) {
      matchReasons.push("SC/ST eligible");
    }
    if (matchReasons.length === 0) matchReasons.push("General eligibility");

    return {
      api_id: row.api_id,
      scheme_name: row.scheme_name || "Untitled Scheme",
      description: fields.briefDescription || "",
      categories: cats,
      matchReasons,
      benefits: fields.benefits || fields.briefDescription || "",
      howToApply: fields.howToApply || "",
      documents: fields.documents || [],
      ministry: fields.nodalMinistryName || "",
      slug: row.slug || "",
      relevanceScore: matchReasons.length * 10,
    };
  });

  // Sort by relevance
  schemes.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    schemes,
    totalMatched: schemes.length,
    filtersApplied,
    queryTime: Date.now() - start,
  };
}
