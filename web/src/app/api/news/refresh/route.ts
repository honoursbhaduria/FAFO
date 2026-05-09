// ============================================================
// POST /api/news/refresh — Force refresh the feed (30-min cooldown)
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forceRefreshFeed, buildFeedResponse } from "@/lib/news/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let userId = body.userId;

    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { error: "No user found." },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    const result = await forceRefreshFeed(userId);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, cooldownEndsAt: result.cooldownEndsAt },
        { status: 429 }
      );
    }

    // Rebuild full feed response with interactions
    const feed = await buildFeedResponse(userId);
    return NextResponse.json({ ...feed, refreshedAt: result.fetchedAt });
  } catch (error) {
    console.error("[API /news/refresh] Error:", error);
    return NextResponse.json(
      { error: "Failed to refresh feed" },
      { status: 500 }
    );
  }
}
