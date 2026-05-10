import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { forceRefreshFeed, buildFeedResponse } from "@/lib/news/cache";

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await forceRefreshFeed(userId);
    
    if ("error" in result) {
      return NextResponse.json(result, { status: 429 });
    }

    // Return the full updated feed structure
    const feed = await buildFeedResponse(userId);
    return NextResponse.json(feed);
  } catch (error) {
    console.error("[API /news/refresh] Error:", error);
    return NextResponse.json({ error: "Failed to refresh feed" }, { status: 500 });
  }
}
