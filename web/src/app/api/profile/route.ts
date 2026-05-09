import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
