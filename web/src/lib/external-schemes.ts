import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

const MYSCHEME_API_URL = process.env.MYSCHEME_API_URL || "https://api.myscheme.gov.in/search/v6/schemes";
const MYSCHEME_API_KEY = process.env.MYSCHEME_API_KEY || "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc";

interface MySchemeItem {
  id: string;
  fields?: {
    slug?: string;
    schemeName?: string;
    schemeCategory?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function fetchAndStoreExternalSchemes(query = "", _category = "", page = 1) {
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const params = new URLSearchParams({
    lang: "en",
    q: "[]",
    keyword: query,
    sort: "",
    from: offset.toString(),
    size: pageSize.toString()
  });

  try {
    const response = await fetch(`${MYSCHEME_API_URL}?${params.toString()}`, {
      headers: {
        "x-api-key": MYSCHEME_API_KEY,
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
        "origin": "https://www.myscheme.gov.in",
        "referer": "https://www.myscheme.gov.in/"
      }
    });

    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`);
    }

    const data = await response.json();
    const items = (data?.data?.hits?.items || []) as MySchemeItem[];

    if (items.length > 0) {
      const upsertPromises = items.map((item) => {
        const fields = item.fields || {};
        return prisma.schemes.upsert({
          where: { api_id: item.id },
          update: {
            slug: fields.slug,
            scheme_name: fields.schemeName,
            categories: (fields.schemeCategory || []) as Prisma.InputJsonValue,
            raw_data: item as unknown as Prisma.InputJsonValue,
            fetched_at: new Date()
          },
          create: {
            api_id: item.id,
            slug: fields.slug,
            scheme_name: fields.schemeName,
            categories: (fields.schemeCategory || []) as Prisma.InputJsonValue,
            raw_data: item as unknown as Prisma.InputJsonValue,
            fetched_at: new Date()
          }
        });
      });

      await Promise.all(upsertPromises);
    }

    return {
      items: items.map((item) => ({
        api_id: item.id,
        slug: item.fields?.slug,
        scheme_name: item.fields?.schemeName,
        categories: item.fields?.schemeCategory || [],
        raw_data: item,
        fetched_at: new Date()
      })),
      total: data?.data?.hits?.page?.total || 0
    };
  } catch (error) {
    console.error("External API Fetch Error:", error);
    return { items: [], total: 0 };
  }
}
