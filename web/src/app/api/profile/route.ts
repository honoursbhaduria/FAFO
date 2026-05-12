import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { invalidateUserCache } from "@/lib/news/cache";

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role === "CONSULTANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = auth.userId;

    const body = await request.json();
    const {
      businessName,
      industry,
      entityType,
      state,
      district,
      isWomenOwned,
      isScStOwned,
      isStartup,
      gstin,
      udyamReg,
      pan,
      annualTurnover,
      employeeCount,
      goals,
    } = body;

    const profile = await prisma.businessProfile.upsert({
      where: { userId },
      update: {
        businessName,
        industry,
        entityType,
        state,
        district: district || "",
        isWomenOwned: !!isWomenOwned,
        isScStOwned: !!isScStOwned,
        isStartup: !!isStartup,
        gstin,
        udyamReg,
        pan,
        annualTurnover,
        employeeCount: parseInt(String(employeeCount)) || 0,
        goals: goals || [],
      },
      create: {
        userId,
        businessName: businessName || "My Business",
        industry: industry || "General",
        entityType: entityType || "Startup",
        state: state || "Delhi",
        district: district || "",
        isWomenOwned: !!isWomenOwned,
        isScStOwned: !!isScStOwned,
        isStartup: !!isStartup,
        gstin,
        udyamReg,
        pan,
        annualTurnover,
        employeeCount: parseInt(String(employeeCount)) || 0,
        goals: goals || [],
      },
    });

    // Invalidate news cache so the feed updates with new profile data
    await invalidateUserCache(userId);

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role === "CONSULTANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = auth.userId;

    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
    });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
