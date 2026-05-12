import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getAuthUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WIKI_API_URL = process.env.WIKI_API_URL || "https://en.wikipedia.org/w/api.php";
const WIKI_BASE_URL = process.env.WIKI_BASE_URL || "https://en.wikipedia.org/wiki/";

// Wikipedia search helpers (inline to avoid cross-route imports)
async function searchWikipedia(query: string) {
  try {
    const searchQuery = `${query} government scheme India`;
    const url = `${WIKI_API_URL}?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=8&format=json&origin=*`;
    console.log("Searching Wikipedia:", url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Wikipedia Search Failed:", res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return data.query?.search || [];
  } catch (error) {
    console.error("Wikipedia Search Error:", error);
    return [];
  }
}

async function getPageExtract(pageId: number): Promise<string> {
  try {
    const url = `${WIKI_API_URL}?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&exsentences=4&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return "";
    return pages[String(pageId)]?.extract || "";
  } catch (error) {
    console.error("Wikipedia Extract Error:", error);
    return "";
  }
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
        url: `${WIKI_BASE_URL}${encodeURIComponent(result.title.replace(/ /g, "_"))}`,
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
      description: "Search for Indian government schemes and yojanas by topic.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Sector or topic (e.g. 'MSME', 'farming')"
          }
        },
        required: ["topic"]
      }
    }
  }
];

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Fetch Chat History Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chatMessage.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Chat History Error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    const { message, history } = await request.json();

    console.log("Runtime check - Global fetch available:", typeof fetch !== 'undefined');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        content: `You are OneClickSathi AI, an assistant for MSMEs and citizens in India. 

Tool Usage:
- Use 'search_government_schemes' to find information about yojanas and welfare programs.
- Only provide the 'topic' parameter.
- Do not attempt to use any other tools.

Be professional and concise.${userContext}`
      },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    // Save user message to database
    if (userId) {
      await prisma.chatMessage.create({
        data: {
          userId,
          role: "user",
          content: message,
          type: "text"
        }
      });
    }

    // First call: let Groq decide if it needs to use tools
    console.log("Groq API Key length:", process.env.GROQ_API_KEY?.length || 0);
    console.log("Calling Groq (first pass)...");
    
    let firstResponse;
    try {
      firstResponse = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        tools,
        tool_choice: "auto",
      });
    } catch (err: any) {
      console.error("Groq First Pass Detailed Error:", {
        message: err.message,
        stack: err.stack,
        cause: err.cause,
        status: err.status,
        type: err.type
      });
      throw err; // Re-throw to be caught by the outer catch
    }

    const firstChoice = firstResponse.choices[0]?.message;
    console.log("Groq responded (first pass). Tool calls:", firstChoice?.tool_calls?.length || 0);

    // Check if Groq wants to call a tool
    if (firstChoice?.tool_calls && firstChoice.tool_calls.length > 0) {
      const toolCall = firstChoice.tool_calls[0];
      const toolName = toolCall.function.name;

      if (toolName === "search_government_schemes") {
        let topic = message;
        try {
          const args = JSON.parse(toolCall.function.arguments);
          topic = args.topic || message;
        } catch (e) {
          console.warn("Failed to parse tool arguments, falling back to original message:", e);
        }

        // Fetch schemes from Wikipedia
        console.log("Fetching schemes for topic:", topic);
        const schemes = await fetchSchemes(topic);

        // Send tool result back to Groq for a nice summary
        // Ensure the assistant message in history is correctly formatted
        const assistantToolCallMessage = {
          role: "assistant",
          content: firstChoice.content || null,
          tool_calls: firstChoice.tool_calls,
        };

        const followUpMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
          ...messages,
          assistantToolCallMessage as Groq.Chat.Completions.ChatCompletionMessageParam,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ results: schemes }),
          }
        ];

        console.log("Calling Groq (second pass - following tool result)...");
        const secondResponse = await groq.chat.completions.create({
          messages: followUpMessages,
          model: "llama-3.1-8b-instant",
        });

        const responseText = secondResponse.choices[0]?.message?.content || "Here are the government schemes I found:";
        console.log("Groq responded (second pass).");

        // Save AI response to database
        if (userId) {
          await prisma.chatMessage.create({
            data: {
              userId,
              role: "model",
              content: responseText,
              type: "schemes",
              schemes: schemes as any
            }
          });
        }

        return NextResponse.json({
          text: responseText,
          type: "schemes",
          schemes,
        });
      } else {
        const responseText = firstChoice.content || "I'm looking into that for you. Could you please specify which sector or scheme you're interested in?";
        
        // Save AI response to database
        if (userId) {
          await prisma.chatMessage.create({
            data: {
              userId,
              role: "model",
              content: responseText,
              type: "text"
            }
          });
        }

        return NextResponse.json({
          text: responseText,
          type: "text"
        });
      }
    }

    const responseText = firstChoice?.content || "";

    // Save AI response to database
    if (userId && responseText) {
      await prisma.chatMessage.create({
        data: {
          userId,
          role: "model",
          content: responseText,
          type: "text"
        }
      });
    }

    // No tool call — return regular response
    return NextResponse.json({
      text: responseText,
      type: "text",
    });
  } catch (error: any) {
    console.error("AI Chat Error Details:", error);
    
    // Check for specific Groq errors
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          text: "The AI service is unauthorized. Please check your GROQ_API_KEY in the .env file.",
          details: "401 Unauthorized"
        },
        { status: 401 }
      );
    }

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
