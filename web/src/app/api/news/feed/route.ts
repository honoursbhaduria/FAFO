// ============================================================
// GET /api/news/feed — Returns the scored, ranked feed
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildFeedResponse } from "@/lib/news/cache";

export async function GET(request: Request) {
  try {
    // Auth: Get userId from query params (or from session in production)
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      // Fallback: grab first user from DB (demo mode)
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { error: "No user found. Please create a profile first." },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    const feed = await buildFeedResponse(userId);
    return NextResponse.json(feed);
  } catch (error) {
    console.error("[API /news/feed] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news feed" },
      { status: 500 }
    );
  }
}
