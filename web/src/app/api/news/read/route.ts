import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { markAsRead } from "@/lib/news/cache";

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { articleId } = await request.json();
    if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

    await markAsRead(userId, articleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /news/read] Error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
