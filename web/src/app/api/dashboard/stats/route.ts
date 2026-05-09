import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const [user, docCount, taskCount, applicationCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { 
          name: true, 
          email: true,
          profile: true,
        },
      }),
      prisma.document.count({ where: { userId } }),
      prisma.complianceTask.count({ where: { userId, status: "PENDING" } }),
      prisma.application.count({ where: { userId } }),
    ]);

    const upcomingTasks = await prisma.complianceTask.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { dueDate: "asc" },
      take: 3,
    });

    // Mock recommendations for now, could be improved with logic
    const recommendedSchemes = [
      { 
        name: "MSME Idea Hackathon 3.0", 
        authority: "Ministry of MSME", 
        benefit: "Up to ₹15 Lakhs grant",
        deadline: "Oct 30, 2024"
      },
      { 
        name: "CLCSS for Technology Upgradation", 
        authority: "SIDBI", 
        benefit: "15% Capital Subsidy",
        deadline: "Ongoing"
      },
    ];

    return NextResponse.json({
      user,
      stats: {
        docCount,
        taskCount,
        applicationCount,
        eligibleSchemes: 12, // Placeholder for recommendation engine count
      },
      upcomingTasks,
      recommendedSchemes,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
