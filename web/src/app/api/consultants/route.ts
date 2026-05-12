import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const consultants = await prisma.consultantProfile.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        experience: true,
        hourlyRate: true,
        bio: true,
        rating: true,
        reviewCount: true,
        verified: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        rating: "desc"
      }
    });

    return NextResponse.json({ consultants });
  } catch (error) {
    console.error("Fetch Consultants Error:", error);
    return NextResponse.json({ error: "Failed to fetch consultants" }, { status: 500 });
  }
}
