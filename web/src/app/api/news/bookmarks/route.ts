import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getBookmarkedArticles } from "@/lib/news/cache";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookmarks = await getBookmarkedArticles(userId);
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("[API /news/bookmarks] Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}
