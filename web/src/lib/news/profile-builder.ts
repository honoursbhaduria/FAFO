// ============================================================
// Profile Builder — Build weighted keyword profile from user answers
// ============================================================

import { prisma } from "@/lib/prisma";
import type { UserKeywordProfile, WeightedKeyword, KeywordExpansionsMap } from "@/types/news";
import keywordExpansions from "@/data/keyword-expansions.json";

/** Weight for each field category */
const FIELD_WEIGHTS: Record<string, number> = {
  // BusinessProfile fields
  industry: 5,
  entityType: 2,
  state: 4,
  district: 4,
  annualTurnover: 2,
  employeeCount: 1,
  // Boolean-derived
  isWomenOwned: 3,
  isScStOwned: 3,
  isStartup: 2,
  // Questionnaire / generic adaptive fields
  sector: 5,
  business_type: 5,
  stage: 2,
  location: 4,
  business_age: 2,
  turnover: 2,
  employees: 1,
  caste: 3,
  gender: 3,
  religion: 3,
  employment_status: 2,
  // Sector-branch questionnaire answers (higher weight for specificity)
  it_startup_type: 4,
  it_funding_stage: 3,
  mfg_product_type: 4,
  mfg_export_status: 3,
  food_fssai: 2,
  food_type: 4,
  agri_land: 2,
  agri_crop_type: 4,
  health_type: 4,
  retail_gst: 2,
  retail_online: 3,
  edu_type: 4,
};

/** Default weight for any field not explicitly listed */
const DEFAULT_WEIGHT = 2;

/** Friendly labels for sector values */
const SECTOR_LABELS: Record<string, string> = {
  "IT/Software": "IT / Software",
  "Manufacturing": "Manufacturing",
  "Food & Beverage": "Food & Beverage",
  "Agriculture": "Agriculture",
  "Healthcare": "Healthcare",
  "Retail/Trading": "Retail / Trading",
  "Education": "Education",
  "Textile": "Textile & Handicraft",
  "Construction": "Construction",
  "Transport": "Transport & Logistics",
  "Service": "Services",
  "Handicraft": "Handicraft",
  "Renewable Energy": "Renewable Energy",
  "Transport & Logistics": "Transport & Logistics",
  "Tourism & Hospitality": "Tourism & Hospitality",
};

/**
 * Look up the expansion list in the config for a given answer value.
 * Returns a list of keyword strings if found, otherwise wraps the
 * raw value itself as a single keyword.
 */
function expandValue(value: string): { keywords: string[]; multiplier: number } {
  const expansions = keywordExpansions as KeywordExpansionsMap;
  const entry = expansions[value];
  if (entry) {
    return { keywords: entry.keywords, multiplier: entry.weight_multiplier };
  }
  // Fallback: use the raw value itself as a keyword
  return { keywords: [value.toLowerCase()], multiplier: 1.0 };
}

/**
 * Converts a BusinessProfile record into a flat Record<string,string>
 * representation suitable for keyword extraction.
 */
function profileToAnswers(profile: {
  industry: string;
  entityType: string;
  state: string;
  district: string;
  annualTurnover: string | null;
  employeeCount: number | null;
  isWomenOwned: boolean;
  isScStOwned: boolean;
  isStartup: boolean;
  goals: string[];
  questionnaireAnswers?: any;
}): Record<string, string> {
  const answers: Record<string, string> = {
    industry: profile.industry,
    entityType: profile.entityType,
    state: profile.state,
    district: profile.district,
  };

  if (profile.annualTurnover) answers.annualTurnover = profile.annualTurnover;
  if (profile.employeeCount !== null)
    answers.employeeCount = String(profile.employeeCount);
  if (profile.isWomenOwned) answers.isWomenOwned = "Women";
  if (profile.isScStOwned) answers.isScStOwned = "SC";
  if (profile.isStartup) answers.isStartup = "Startup";

  // Goals as comma-separated string
  if (profile.goals && profile.goals.length > 0) {
    answers.goals = profile.goals.join(", ");
  }

  // Merge in questionnaire answers (sector-branch answers like it_startup_type, food_type, etc.)
  if (profile.questionnaireAnswers && typeof profile.questionnaireAnswers === "object") {
    const qa = profile.questionnaireAnswers as Record<string, any>;
    // Only merge string values; skip arrays and objects already handled above
    for (const [key, value] of Object.entries(qa)) {
      if (typeof value === "string" && value.trim() && !answers[key]) {
        answers[key] = value;
      }
    }
  }

  return answers;
}

/**
 * Build a weighted keyword profile for the specified user.
 *
 * 1. Loads the BusinessProfile from Neon DB via Prisma
 * 2. Expands every answer field into keywords using keyword-expansions.json
 * 3. Assigns weights per field type
 * 4. Returns a deduplicated, sorted UserKeywordProfile
 */
export async function buildUserKeywordProfile(
  userId: string
): Promise<UserKeywordProfile> {
  // 1. Fetch profile from DB
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    // Return an empty profile when no answers exist yet
    return {
      userId,
      keywords: [],
      rawAnswers: {},
      sectorLabel: "",
      builtAt: new Date().toISOString(),
    };
  }

  // 2. Determine sector label for UI display
  const sectorLabel = SECTOR_LABELS[profile.industry] || profile.industry || "General";

  // 3. Convert to flat answers map (includes questionnaire branch answers)
  const rawAnswers = profileToAnswers(profile);

  // 4. Expand & weight
  const keywordMap = new Map<string, number>(); // term → accumulated weight

  for (const [field, value] of Object.entries(rawAnswers)) {
    if (!value || value.trim() === "") continue;

    const baseWeight = FIELD_WEIGHTS[field] ?? DEFAULT_WEIGHT;
    const { keywords: expanded, multiplier } = expandValue(value);

    for (const term of expanded) {
      const effectiveWeight = baseWeight * multiplier;
      const existing = keywordMap.get(term) ?? 0;
      // Sum weights when the same keyword is contributed by multiple fields
      keywordMap.set(term, existing + effectiveWeight);
    }
  }

  // Also expand goals as keywords (from questionnaire)
  if (profile.goals && profile.goals.length > 0) {
    for (const goal of profile.goals) {
      const goalWeight = FIELD_WEIGHTS["goals"] ?? DEFAULT_WEIGHT;
      const { keywords: goalExpanded, multiplier: goalMul } = expandValue(goal);
      for (const term of goalExpanded) {
        const effectiveWeight = goalWeight * goalMul;
        const existing = keywordMap.get(term) ?? 0;
        keywordMap.set(term, existing + effectiveWeight);
      }
      // Also add the raw goal as a keyword
      const rawGoal = goal.toLowerCase().trim();
      if (rawGoal) {
        const existing = keywordMap.get(rawGoal) ?? 0;
        keywordMap.set(rawGoal, existing + 2);
      }
    }
  }

  // Always include high-weight India-focused business keywords
  // These ensure the feed stays India-specific
  const alwaysInclude = [
    { term: "india", weight: 4 },
    { term: "indian", weight: 3 },
    { term: "msme", weight: 4 },
    { term: "government scheme", weight: 3 },
    { term: "subsidy", weight: 3 },
    { term: "compliance", weight: 3 },
    { term: "regulation india", weight: 3 },
    { term: "business india", weight: 3 },
    { term: "policy", weight: 2 },
    { term: "ministry", weight: 2 },
  ];
  for (const { term, weight } of alwaysInclude) {
    const existing = keywordMap.get(term) ?? 0;
    keywordMap.set(term, existing + weight);
  }

  // 5. Build sorted keyword array
  const keywords: WeightedKeyword[] = Array.from(keywordMap.entries())
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => b.weight - a.weight);

  return {
    userId,
    keywords,
    rawAnswers,
    sectorLabel,
    builtAt: new Date().toISOString(),
  };
}
