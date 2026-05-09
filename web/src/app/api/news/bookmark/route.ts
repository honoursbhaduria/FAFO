import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { toggleBookmark } from "@/lib/news/cache";

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const articleId = body.articleId;

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const isBookmarked = await toggleBookmark(userId, articleId);
    return NextResponse.json({ articleId, isBookmarked });
  } catch (error) {
    console.error("[API /news/bookmark] Error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
