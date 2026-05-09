// ============================================================
// GET /api/news/bookmarks — Return all bookmarked articles
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBookmarkedArticles } from "@/lib/news/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: "No user found." }, { status: 401 });
      }
      userId = user.id;
    }

    const bookmarks = await getBookmarkedArticles(userId);
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("[API /news/bookmarks] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
