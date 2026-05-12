import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getDashboardData(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
