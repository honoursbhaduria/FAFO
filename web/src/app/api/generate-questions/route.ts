import { NextResponse } from "next/server";
import { getSchemaMap } from "@/lib/schema-inspector";
import { resolveQuestions } from "@/lib/question-engine";

export async function GET() {
  try {
    const schema = await getSchemaMap();
    const config = resolveQuestions(schema);
    return NextResponse.json(config);
  } catch (error) {
    console.error("[generate-questions] Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
