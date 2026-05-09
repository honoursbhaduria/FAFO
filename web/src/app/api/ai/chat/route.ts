import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Wikipedia search helpers (inline to avoid cross-route imports)
async function searchWikipedia(query: string) {
  const searchQuery = `${query} government scheme India`;
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=8&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.query?.search || [];
}

async function getPageExtract(pageId: number): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&exsentences=4&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return "";
  return pages[String(pageId)]?.extract || "";
}

function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  const categories: Record<string, string[]> = {
    "Agriculture": ["agriculture", "farm", "kisan", "crop", "irrigation", "soil", "rural development"],
    "Education": ["education", "scholarship", "school", "student", "vidya", "shiksha", "literacy"],
    "Healthcare": ["health", "medical", "ayushman", "hospital", "swasthya", "insurance", "treatment"],
    "Finance & Banking": ["finance", "loan", "credit", "bank", "mudra", "subsidy", "pension"],
    "Women & Child": ["women", "girl", "child", "mahila", "beti", "maternity", "sukanya"],
    "Housing": ["housing", "awas", "home", "shelter"],
    "Employment": ["employment", "skill", "job", "rozgar", "kaushal", "training", "livelihood"],
    "Digital India": ["digital", "technology", "internet", "broadband", "e-governance"],
    "Infrastructure": ["infrastructure", "road", "highway", "smart city", "urban", "swachh"],
    "MSME": ["msme", "enterprise", "startup", "udyam", "business", "entrepreneur", "industry"],
    "Energy": ["solar", "energy", "electricity", "power", "ujjwala", "gas", "renewable"],
    "Social Welfare": ["welfare", "ration", "food security", "poverty", "jan dhan"],
  };
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return "Government Scheme";
}

async function fetchSchemes(topic: string) {
  const searchResults = await searchWikipedia(topic);
  const schemes = await Promise.all(
    searchResults.map(async (result: any) => {
      const summary = await getPageExtract(result.pageid);
      const cleanSummary = summary || result.snippet.replace(/<[^>]*>/g, "");
      return {
        title: result.title,
        summary: cleanSummary,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, "_"))}`,
        category: detectCategory(result.title, cleanSummary),
      };
    })
  );

  // Filter for India-relevant results
  const indiaSchemes = schemes.filter((s) => {
    const text = `${s.title} ${s.summary}`.toLowerCase();
    return (
      text.includes("india") || text.includes("pradhan mantri") ||
      text.includes("bharat") || text.includes("government of india") ||
      text.includes("ministry") || text.includes("rupee") ||
      text.includes("crore") || text.includes("lakh") ||
      text.includes("indian") || text.includes("yojana") ||
      text.includes("abhiyan") || text.includes("mission") ||
      text.includes("scheme")
    );
  });

  return indiaSchemes.length > 0 ? indiaSchemes.slice(0, 6) : schemes.slice(0, 6);
}

// Groq tool definition for searching government schemes
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_government_schemes",
      description: "Search for Indian government schemes related to a given topic. Use this tool whenever the user asks about government schemes, yojanas, subsidies, or welfare programs in India. Always call this tool for scheme-related queries.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "The topic or sector to search schemes for, e.g. 'agriculture', 'education', 'MSME', 'women empowerment', 'healthcare'"
          }
        },
        required: ["topic"]
      }
    }
  }
];

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const formattedHistory = history
      ? history.map((msg: any) => ({
          role: msg.role === "model" ? "assistant" : msg.role,
          content: msg.content || (msg.parts && msg.parts[0]?.text) || "",
        }))
      : [];

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are OneClickSathi AI, a premium assistant for MSMEs in India. Your goal is to help entrepreneurs find government schemes, understand compliance requirements (GST, TDS, etc.), and manage business growth. Be professional, encouraging, and provide clear, actionable advice. Keep your answers concise.

IMPORTANT: When the user asks about government schemes, welfare programs, yojanas, subsidies, or any India-related policy programs, you MUST use the search_government_schemes tool to look up real information. Do not make up scheme names or details — always search first.`
      },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    // First call: let Groq decide if it needs to use tools
    const firstResponse = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      tools,
      tool_choice: "auto",
    });

    const firstChoice = firstResponse.choices[0]?.message;

    // Check if Groq wants to call a tool
    if (firstChoice?.tool_calls && firstChoice.tool_calls.length > 0) {
      const toolCall = firstChoice.tool_calls[0];

      if (toolCall.function.name === "search_government_schemes") {
        const args = JSON.parse(toolCall.function.arguments);
        const topic = args.topic || message;

        // Fetch schemes from Wikipedia
        const schemes = await fetchSchemes(topic);

        // Send tool result back to Groq for a nice summary
        const followUpMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
          ...messages,
          firstChoice as Groq.Chat.Completions.ChatCompletionMessageParam,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(schemes),
          }
        ];

        const secondResponse = await groq.chat.completions.create({
          messages: followUpMessages,
          model: "llama-3.3-70b-versatile",
        });

        const responseText = secondResponse.choices[0]?.message?.content || "Here are the government schemes I found:";

        return NextResponse.json({
          text: responseText,
          type: "schemes",
          schemes,
        });
      }
    }

    // No tool call — return regular response
    return NextResponse.json({
      text: firstChoice?.content || "",
      type: "text",
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI", text: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
