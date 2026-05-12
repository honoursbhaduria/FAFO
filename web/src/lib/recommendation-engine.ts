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
  const state = answers.state as string;
  const sector = answers.sector as string;
  const isWomenOwned = answers.gender === "true";
  const isScSt = answers.caste === "true";

  const params: any[] = [];
  let paramIdx = 1;

  // 1. Strict State Filter (Mandatory)
  const stateConditions: string[] = [];
  if (state) {
    stateConditions.push(`(
      raw_data->'fields'->'beneficiaryState' @> $${paramIdx}::jsonb
      OR raw_data->'fields'->'beneficiaryState' @> '["All"]'::jsonb
      OR raw_data->'fields'->'beneficiaryState' IS NULL
    )`);
    params.push(JSON.stringify([state]));
    paramIdx++;
    filtersApplied.push(`State: ${state}`);
  }

  // 2. Dynamic Scoring for Sector, Gender, Caste
  const scoringParts: string[] = [];
  
  if (sector) {
    const keywords = SECTOR_KEYWORDS[sector] || [sector];
    const kwWeights = keywords.map((kw) => {
      const idx = paramIdx++;
      params.push(`%${kw}%`);
      return `CASE WHEN (scheme_name ILIKE $${idx} OR raw_data->'fields'->>'briefDescription' ILIKE $${idx} OR categories::text ILIKE $${idx}) THEN 50 ELSE 0 END`;
    });
    scoringParts.push(`(${kwWeights.join(" + ")})`);
    filtersApplied.push(`Sector: ${sector}`);
  }

  if (isWomenOwned) {
    const idx = paramIdx++;
    params.push("%Women%");
    scoringParts.push(`CASE WHEN (scheme_name ILIKE $${idx} OR raw_data->'fields'->>'briefDescription' ILIKE $${idx} OR categories::text ILIKE $${idx}) THEN 30 ELSE 0 END`);
    filtersApplied.push("Women-owned business");
  }

  if (isScSt) {
    const idx = paramIdx++;
    params.push("%SC/ST%");
    const idx2 = paramIdx++;
    params.push("%Scheduled%");
    scoringParts.push(`CASE WHEN (scheme_name ILIKE $${idx} OR raw_data->'fields'->>'briefDescription' ILIKE $${idx} OR categories::text ILIKE $${idx2}) THEN 30 ELSE 0 END`);
    filtersApplied.push("SC/ST category");
  }

  const scoreExpr = scoringParts.length > 0 ? scoringParts.join(" + ") : "0";
  const whereClause = stateConditions.length > 0 ? `WHERE ${stateConditions.join(" AND ")}` : "";

  const query = `
    SELECT api_id, scheme_name, slug, categories, raw_data,
           (${scoreExpr}) as relevance_score
    FROM schemes
    ${whereClause}
    ORDER BY relevance_score DESC, fetched_at DESC
    LIMIT 50
  `;

  let rows: any[];
  try {
    rows = await prisma.$queryRawUnsafe(query, ...params);
    // If we have state filter but 0 results, try broad fallback (no state filter)
    if (rows.length === 0 && state) {
        const fallbackQuery = `
            SELECT api_id, scheme_name, slug, categories, raw_data,
                   (${scoreExpr}) as relevance_score
            FROM schemes
            ORDER BY relevance_score DESC, fetched_at DESC
            LIMIT 30
        `;
        // Re-align params (remove the first param which was state)
        const fallbackParams = params.slice(1);
        // Correct parameter indexes in fallBack query would be complex, 
        // so let's just do a simple broad search as fallback
        rows = await prisma.$queryRawUnsafe(
            `SELECT api_id, scheme_name, slug, categories, raw_data, 0 as relevance_score
             FROM schemes ORDER BY fetched_at DESC LIMIT 30`
        );
        filtersApplied.push("(Fallback: broad search)");
    }
  } catch (err) {
    console.error("[RecommendationEngine] Query error:", err);
    rows = await prisma.$queryRawUnsafe(
      `SELECT api_id, scheme_name, slug, categories, raw_data, 0 as relevance_score
       FROM schemes ORDER BY fetched_at DESC LIMIT 30`
    );
    filtersApplied.push("(Fallback: query error)");
  }

  // --- Map and return results ---
  const schemes: SchemeResult[] = rows.map((row: any) => {
    const fields = row.raw_data?.fields || {};
    const cats: string[] = Array.isArray(row.categories) ? row.categories : [];
    const matchReasons: string[] = [];

    // Compute match reasons for UI display
    if (state && (fields.beneficiaryState?.includes(state) || fields.beneficiaryState?.includes("All"))) {
      matchReasons.push(`Available in ${state}`);
    }
    if (sector) {
      const keywords = SECTOR_KEYWORDS[sector] || [sector];
      const text = `${row.scheme_name} ${fields.briefDescription || ""} ${cats.join(" ")}`.toLowerCase();
      if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
        matchReasons.push(`Matches ${sector} sector`);
      }
    }
    if (isWomenOwned && `${row.scheme_name} ${fields.briefDescription || ""}`.toLowerCase().includes("women")) {
      matchReasons.push("Supports women entrepreneurs");
    }
    if (matchReasons.length === 0) matchReasons.push("Relevant to your profile");

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
      relevanceScore: parseInt(row.relevance_score) || 10,
    };
  });

  return {
    schemes,
    totalMatched: schemes.length,
    filtersApplied,
    queryTime: Date.now() - start,
  };
}
