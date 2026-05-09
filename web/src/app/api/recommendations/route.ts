import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendation-engine";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = body.answers || {};

    // Also save answers to BusinessProfile
    try {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: { email: "user@oneclicksathi.com", password: "demo", name: answers.applicant_name || "User" },
        });
      }
      await prisma.businessProfile.upsert({
        where: { userId: user.id },
        update: {
          businessName: (answers.applicant_name as string) || "My Business",
          industry: (answers.sector as string) || "General",
          entityType: (answers.entity_type as string) || (answers.business_stage as string) || "Startup",
          state: (answers.state as string) || "Maharashtra",
          district: "",
          isWomenOwned: answers.gender === "true",
          isScStOwned: answers.caste === "true",
          isStartup: answers.is_startup === "true" || answers.business_stage === "Startup",
          annualTurnover: (answers.annual_turnover as string) || undefined,
          employeeCount: parseInt(answers.employee_count as string) || undefined,
          goals: Array.isArray(answers.goals) ? answers.goals : [],
        },
        create: {
          userId: user.id,
          businessName: (answers.applicant_name as string) || "My Business",
          industry: (answers.sector as string) || "General",
          entityType: (answers.entity_type as string) || (answers.business_stage as string) || "Startup",
          state: (answers.state as string) || "Maharashtra",
          district: "",
          isWomenOwned: answers.gender === "true",
          isScStOwned: answers.caste === "true",
          isStartup: answers.is_startup === "true" || answers.business_stage === "Startup",
          annualTurnover: (answers.annual_turnover as string) || undefined,
          employeeCount: parseInt(answers.employee_count as string) || undefined,
          goals: Array.isArray(answers.goals) ? answers.goals : [],
        },
      });
    } catch (e) {
      console.error("[recommendations] Profile save error:", e);
    }

    const result = await getRecommendations(answers);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[recommendations] Error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
