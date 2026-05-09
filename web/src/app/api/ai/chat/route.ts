import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getAuthUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  return schemes.slice(0, 6);
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
    const userId = await getAuthUserId();
    const { message, history } = await request.json();

    let userContext = "";
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (user?.profile) {
        const p = user.profile;
        userContext = `\n\nUSER CONTEXT:\nBusiness: ${p.businessName}\nIndustry: ${p.industry}\nType: ${p.entityType}\nState: ${p.state}\nStartup: ${p.isStartup ? 'Yes' : 'No'}\nGoals: ${p.goals.join(', ')}`;
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const formattedHistory = history
      ? history.map((msg: any) => ({
          role: msg.role === "model" || msg.role === "assistant" ? "assistant" : msg.role,
          content: msg.content || (msg.parts && msg.parts[0]?.text) || "",
        }))
      : [];

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are OneClickSathi AI, a premium assistant for MSMEs and citizens in India. 

STRICT TOOL USAGE RULES:
1. You have ONLY ONE tool available: 'search_government_schemes'.
2. You MUST use 'search_government_schemes' when a user mentions a scheme, yojana, or asks for information about a specific program.
3. NEVER attempt to call tools named 'brave_search', 'google_search', 'web_search', or any tool other than 'search_government_schemes'.
4. If you need to find information, you MUST use 'search_government_schemes' with a 'topic' parameter.

Be professional, concise, and prioritize using your provided search tool for real-time information.${userContext}`
      },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    // First call: let Groq decide if it needs to use tools
    const firstResponse = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      tools,
      tool_choice: "auto",
    });

    const firstChoice = firstResponse.choices[0]?.message;

    // Check if Groq wants to call a tool
    if (firstChoice?.tool_calls && firstChoice.tool_calls.length > 0) {
      const toolCall = firstChoice.tool_calls[0];
      const toolName = toolCall.function.name;

      if (toolName === "search_government_schemes") {
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
            content: JSON.stringify({ results: schemes }),
          }
        ];

        const secondResponse = await groq.chat.completions.create({
          messages: followUpMessages,
          model: "llama-3.1-8b-instant",
        });

        const responseText = secondResponse.choices[0]?.message?.content || "Here are the government schemes I found:";

        return NextResponse.json({
          text: responseText,
          type: "schemes",
          schemes,
        });
      } else {
        return NextResponse.json({
          text: firstChoice.content || "I'm looking into that for you. Could you please specify which sector or scheme you're interested in?",
          type: "text"
        });
      }
    }

    // No tool call — return regular response
    return NextResponse.json({
      text: firstChoice?.content || "",
      type: "text",
    });
  } catch (error: any) {
    console.error("AI Chat Error Details:", error);
    return NextResponse.json(
      { 
        error: "Failed to get response from AI", 
        text: "Sorry, I encountered an error. Please try again.",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
