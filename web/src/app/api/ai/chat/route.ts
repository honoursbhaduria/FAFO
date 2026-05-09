import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    const msgLower = message.toLowerCase();

    // Check if the user is asking for Wikipedia or Images
    const needsGemini = msgLower.includes("wikipedia") || msgLower.includes("image") || msgLower.includes("picture") || msgLower.includes("photo") || msgLower.includes("show me");

    if (needsGemini) {
      // Use Gemini (gemini-1.5-flash) for Wikipedia/Images
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are OneClickSathi AI. The user is asking for an image or information from Wikipedia. Provide a detailed summary and include relevant markdown image links (e.g., ![image](https://upload.wikimedia.org/wikipedia/commons/...)) if requested. Be helpful and accurate."
      });

      const formattedHistory = history ? history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content || "" }]
      })) : [];

      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return NextResponse.json({ text: response.text() });
    }

    // Default to Groq for standard chat
    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.content || (msg.parts && msg.parts[0]?.text) || "",
    })) : [];

    const messages = [
      {
        role: "system",
        content: "You are OneClickSathi AI, a premium assistant for MSMEs in India. Your goal is to help entrepreneurs find government schemes, understand compliance requirements (GST, TDS, etc.), and manage business growth. Be professional, encouraging, and provide clear, actionable advice. Keep your answers concise."
      },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.1-8b-instant",
    });

    return NextResponse.json({ text: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to get response from AI" }, { status: 500 });
  }
}
