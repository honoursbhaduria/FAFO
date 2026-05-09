import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI("AIzaSyAMFYIs6bRBP2jxBg00v4wxt4nOt6LPx24");

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are OneClickSathi AI, a premium assistant for MSMEs in India. Your goal is to help entrepreneurs find government schemes, understand compliance requirements (GST, TDS, etc.), and manage business growth. Be professional, encouraging, and provide clear, actionable advice. If asked about schemes, refer to the myScheme ecosystem. If asked about compliance, provide general deadlines for Indian businesses."
    });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
