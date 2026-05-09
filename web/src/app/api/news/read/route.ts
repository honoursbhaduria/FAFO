// ============================================================
// POST /api/news/read — Mark an article as read
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markAsRead } from "@/lib/news/cache";

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

    await markAsRead(userId, articleId);
    return NextResponse.json({ articleId, isRead: true });
  } catch (error) {
    console.error("[API /news/read] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
