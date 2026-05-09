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
};

/** Default weight for any field not explicitly listed */
const DEFAULT_WEIGHT = 2;

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
      builtAt: new Date().toISOString(),
    };
  }

  // 2. Convert to flat answers map
  const rawAnswers = profileToAnswers(profile);

  // 3. Expand & weight
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

  // Also always add generic MSME / business India keywords
  const alwaysInclude = ["MSME", "India", "business", "government scheme", "subsidy", "compliance"];
  for (const term of alwaysInclude) {
    const existing = keywordMap.get(term.toLowerCase()) ?? 0;
    keywordMap.set(term.toLowerCase(), existing + 1);
  }

  // 4. Build sorted keyword array
  const keywords: WeightedKeyword[] = Array.from(keywordMap.entries())
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => b.weight - a.weight);

  return {
    userId,
    keywords,
    rawAnswers,
    builtAt: new Date().toISOString(),
  };
}
