import { NextResponse } from "next/server";
import { getSchemaMap } from "@/lib/schema-inspector";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    const schema = await getSchemaMap(force);
    return NextResponse.json(schema);
  } catch (error) {
    console.error("[inspect-schema] Error:", error);
    return NextResponse.json({ error: "Failed to inspect schema" }, { status: 500 });
  }
}
