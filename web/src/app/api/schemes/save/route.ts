import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const saved = await prisma.savedScheme.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
    });
    return NextResponse.json({ saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved schemes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { schemeId, schemeName } = await request.json();

    const saved = await prisma.savedScheme.upsert({
      where: {
        userId_schemeId: { userId, schemeId },
      },
      update: {},
      create: {
        userId,
        schemeId,
        schemeName,
      },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save scheme" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const schemeId = searchParams.get("schemeId");

    if (!schemeId) return NextResponse.json({ error: "Scheme ID required" }, { status: 400 });

    await prisma.savedScheme.delete({
      where: {
        userId_schemeId: { userId, schemeId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove saved scheme" }, { status: 500 });
  }
}
