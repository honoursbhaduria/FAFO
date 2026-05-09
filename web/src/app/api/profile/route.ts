import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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
      userId // In a real app, this would come from the session
    } = body;

    // For now, we'll use a hardcoded userId if not provided, or create a mock user
    // In a real scenario, use auth middleware to get the current user's ID
    let finalUserId = userId;
    
    if (!finalUserId) {
      // Look for a mock user or create one for testing
      const mockUser = await prisma.user.findFirst();
      if (mockUser) {
        finalUserId = mockUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: "test@example.com",
            password: "password123", // In reality, hash this!
            name: "Test User"
          }
        });
        finalUserId = newUser.id;
      }
    }

    const profile = await prisma.businessProfile.upsert({
      where: { userId: finalUserId },
      update: {
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
        employeeCount: parseInt(employeeCount) || 0,
        goals,
      },
      create: {
        userId: finalUserId,
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
        employeeCount: parseInt(employeeCount) || 0,
        goals,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  try {
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
