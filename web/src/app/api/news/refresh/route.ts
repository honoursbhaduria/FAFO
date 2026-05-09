import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { fetchAndCacheUserFeed } from "@/lib/news/fetcher";

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const articles = await fetchAndCacheUserFeed(userId);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("[API /news/refresh] Error:", error);
    return NextResponse.json({ error: "Failed to refresh feed" }, { status: 500 });
  }
}
