import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory cache: key = schemeId:contentHash, value = { insights, timestamp }
const insightCache = new Map<
  string,
  { insights: SchemeInsight; contentHash: string; timestamp: number }
>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface SchemeInsight {
  summary: string;
  keyBenefits: string[];
  hiddenEligibility: string[];
  importantDeadlines: string[];
  commonMistakes: string[];
  whoShouldApply: string[];
  warnings: string[];
  recommendations: string[];
}

function hashContent(data: string): string {
  return crypto.createHash("md5").update(data).digest("hex");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schemeId = searchParams.get("schemeId");

    if (!schemeId) {
      return NextResponse.json(
        { error: "schemeId is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    // 1. Fetch the scheme from DB
    const scheme = await prisma.schemes.findUnique({
      where: { api_id: schemeId },
    });

    if (!scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    // 2. Build a content string and hash it for cache invalidation
    const rawData = (scheme.raw_data as any)?.fields || {};
    const contentString = JSON.stringify({
      name: scheme.scheme_name,
      categories: scheme.categories,
      ...rawData,
    });
    const contentHash = hashContent(contentString);

    // 3. Check cache — return if hit and content hasn't changed
    const cached = insightCache.get(schemeId);
    if (
      cached &&
      cached.contentHash === contentHash &&
      Date.now() - cached.timestamp < CACHE_TTL
    ) {
      return NextResponse.json({ insights: cached.insights, cached: true });
    }

    // 4. Build a detailed prompt from scheme data
    const schemeDetails = `
SCHEME NAME: ${scheme.scheme_name || "Unknown"}
CATEGORIES: ${Array.isArray(scheme.categories) ? (scheme.categories as string[]).join(", ") : "N/A"}
MINISTRY/DEPARTMENT: ${rawData.nodalMinistryName || "N/A"}
LEVEL: ${rawData.level || "N/A"}
STATE/REGION: ${Array.isArray(rawData.beneficiaryState) ? rawData.beneficiaryState.join(", ") : rawData.beneficiaryState || "All India"}

DESCRIPTION: ${rawData.briefDescription || "No description available"}

ELIGIBILITY: ${rawData.eligibility || "N/A"}
GENDER: ${rawData.gender || "All"}
CASTE: ${rawData.caste || "All"}
RESIDENCE: ${rawData.residence || "Both"}
EMPLOYMENT STATUS: ${rawData.employmentStatus || "N/A"}

BENEFITS: ${rawData.benefits || "N/A"}

APPLICATION PROCESS: ${rawData.application || "N/A"}

REQUIRED DOCUMENTS: ${rawData.documents || "N/A"}

URL: ${rawData.url || "N/A"}
`.trim();

    // 5. Call Groq for analysis
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert analyst for Indian government schemes and MSME policies. You provide clear, actionable insights about government schemes. Always respond in valid JSON format only — no markdown, no code blocks, no extra text.`,
        },
        {
          role: "user",
          content: `Analyze this Indian government scheme and provide detailed, scheme-specific insights. Be very specific to THIS scheme's data — do not give generic advice.

${schemeDetails}

Respond ONLY with a valid JSON object in this exact format (no markdown or wrapping):
{
  "summary": "A 1-2 sentence concise insight/recommendation specific to this scheme",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "hiddenEligibility": ["hidden requirement 1", "hidden requirement 2"],
  "importantDeadlines": ["deadline info 1", "deadline info 2"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "whoShouldApply": ["ideal applicant 1", "ideal applicant 2"],
  "warnings": ["warning 1", "warning 2"],
  "recommendations": ["actionable step 1", "actionable step 2"]
}

Rules:
- Each array should have 2-4 items
- Be specific to this scheme, not generic
- If information is not available for a field, provide reasonable inferences based on the scheme type
- Keep each item concise (1-2 sentences max)
- Focus on practical, actionable insights`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const rawText = response.choices[0]?.message?.content || "";

    // 6. Parse the JSON response
    let insights: SchemeInsight;
    try {
      // Try to extract JSON from the response (handle possible markdown wrapping)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      insights = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", rawText);
      // Fallback structured response
      insights = {
        summary: `This scheme (${scheme.scheme_name}) provides government support. Review the eligibility criteria carefully before applying.`,
        keyBenefits: [rawData.benefits || "Financial assistance and government support"],
        hiddenEligibility: ["Verify all required documents before starting the application"],
        importantDeadlines: ["Check the official portal for current application windows"],
        commonMistakes: ["Incomplete document submission is the most common rejection reason"],
        whoShouldApply: ["Eligible individuals and businesses as per scheme criteria"],
        warnings: ["Ensure you meet all eligibility requirements before applying"],
        recommendations: ["Visit the official scheme portal for the most up-to-date information"],
      };
    }

    // 7. Cache the result
    insightCache.set(schemeId, {
      insights,
      contentHash,
      timestamp: Date.now(),
    });

    return NextResponse.json({ insights, cached: false });
  } catch (error: any) {
    console.error("Scheme Insight Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
