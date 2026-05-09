import { NextResponse } from "next/server";
import { resolveQuestions } from "@/lib/question-engine";

export async function GET() {
  try {
    // Optimization: Skip expensive DB schema inspection. 
    // We know the BusinessProfile table structure as it's defined in our Prisma schema.
    // We provide a static "Mock" schema that includes all the columns we expect to exist.
    const staticSchema: any = {
      flatColumnNames: [
        "id", "userId", "businessName", "industry", "entityType", "state", 
        "district", "isWomenOwned", "isScStOwned", "isStartup", "gstin", 
        "udyamReg", "pan", "annualTurnover", "employeeCount", "goals"
      ],
      inspectedAt: new Date().toISOString(),
    };

    const config = resolveQuestions(staticSchema);
    
    // Add a cache-control header to make it even faster on repeat loads
    return new NextResponse(JSON.stringify(config), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[generate-questions] Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
