// ============================================================
// POST /api/news/bookmark — Toggle bookmark for an article
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toggleBookmark } from "@/lib/news/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let userId = body.userId;
    const articleId = body.articleId;

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: "No user found." }, { status: 401 });
      }
      userId = user.id;
    }

    const isBookmarked = await toggleBookmark(userId, articleId);
    return NextResponse.json({ articleId, isBookmarked });
  } catch (error) {
    console.error("[API /news/bookmark] Error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
