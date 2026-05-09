import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {};

    if (category) {
      where.categories = {
        array_contains: [category]
      };
    }

    if (query) {
      where.scheme_name = {
        contains: query,
        mode: 'insensitive'
      };
    }

    const [total, items] = await Promise.all([
      prisma.schemes.count({ where }),
      prisma.schemes.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { fetched_at: 'desc' }
      })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
  }
}
