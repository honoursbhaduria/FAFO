import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fetchAndStoreExternalSchemes } from "@/lib/external-schemes";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const where: Prisma.schemesWhereInput = {};

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

    let total: number;
    let items: Record<string, unknown>[];

    const [dbTotal, dbItems] = await Promise.all([
      prisma.schemes.count({ where }),
      prisma.schemes.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { fetched_at: 'desc' }
      })
    ]);

    total = dbTotal;
    items = dbItems;

    // Fallback: If no items found locally, fetch from external API and store
    if (items.length === 0) {
      console.log("No local schemes found. Fetching from external API...");
      const externalData = await fetchAndStoreExternalSchemes(query || "", category || "", page);
      
      if (externalData.items.length > 0) {
        items = externalData.items;
        total = externalData.total;
      }
    }

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
