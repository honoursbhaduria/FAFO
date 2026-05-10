import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { buildFeedResponse } from "@/lib/news/cache";

// GET /api/news/feed - Returns user-specific smart feed
export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const feed = await buildFeedResponse(userId);
    return NextResponse.json(feed);
  } catch (error) {
    console.error("[API /news/feed] Error:", error);
    return NextResponse.json({ error: "Failed to fetch news feed" }, { status: 500 });
  }
}
