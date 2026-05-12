"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, Trash2 } from "lucide-react";
import { SchemeCardGrid, Scheme } from "@/components/ui/SchemeCard";

interface Message {
  role: "user" | "model";
  parts: [{ text: string }];
  type?: "text" | "schemes";
  schemes?: Scheme[];
}

function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const processedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/ai/chat");
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map((m: any) => ({
            role: m.role === "assistant" ? "model" : m.role,
            parts: [{ text: m.content }],
            type: m.type,
            schemes: m.schemes,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete your chat history?")) return;
    
    try {
      const response = await fetch("/api/ai/chat", { method: "DELETE" });
      if (response.ok) {
        setMessages([]);
      } else {
        throw new Error("Failed to delete history");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to clear history. Please try again.");
    }
  };

  const handleSend = useCallback(async (customInput?: string) => {
    const userMessage = (customInput || input).trim();
    if (!userMessage || isLoading) return;

    if (!customInput) setInput("");
    
    const newMessages: Message[] = [
      ...messages,
      { role: "user", parts: [{ text: userMessage }] }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({
            role: m.role === "model" ? "assistant" : m.role,
            content: m.parts[0].text,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.text || errorData.error || "Failed to fetch");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "model",
        parts: [{ text: data.text }],
        type: data.type || "text",
        schemes: data.schemes,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages([
        ...newMessages,
        { role: "model", parts: [{ text: "Sorry, I encountered an error. Please try again." }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  useEffect(() => {
    if (initialQuery && !processedRef.current) {
      processedRef.current = true;
      handleSend(`Tell me more about the ${initialQuery} scheme.`);
    }
  }, [initialQuery, handleSend]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] bg-white rounded-[40px] border border-slate-100 overflow-hidden">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Bot size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Assistant</h2>
            <p className="text-slate-500 text-sm font-medium">Consult with our specialized LLM for instant compliance.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 group disabled:opacity-0 disabled:pointer-events-none"
            title="Clear History"
          >
            <Trash2 size={18} className="transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Clear History</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Neural Link Active
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 no-scrollbar">
        {isHistoryLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Encrypted Records...</p>
          </div>
        ) : messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-4 border border-slate-100 group">
              <Bot size={40} className="text-slate-300 group-hover:text-slate-900 transition-colors duration-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">How can I assist your business?</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm">
                Ask about government schemes, complex compliance logic, or strategic growth opportunities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-2xl w-full">
              {[
                "Analyze my business for MSME schemes",
                "Explain the GST filing architecture",
                "Find agriculture grants in Karnataka",
                "Compare tax benefits for startups"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-6 py-3.5 text-xs font-bold text-slate-600 bg-white border border-slate-100 rounded-2xl hover:border-brand-500 hover:text-brand-600 transition-all text-left group flex items-center justify-between"
                >
                  {suggestion}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-4 max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 ${
                  msg.role === "user" ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-slate-900 text-white border border-slate-800"
                }`}
              >
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="flex flex-col space-y-2">
                <div
                  className={`p-5 rounded-[24px] text-sm font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none border-b-2 border-r-2"
                  }`}
                >
                  {msg.parts[0].text}
                </div>
                {/* Render scheme cards if present */}
                {msg.type === "schemes" && msg.schemes && msg.schemes.length > 0 && (
                  <div className="mt-2">
                    <SchemeCardGrid schemes={msg.schemes} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={18} />
              </div>
              <div className="p-5 rounded-[24px] bg-white text-slate-400 border border-slate-100 rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-brand-600" />
                <span className="font-bold text-xs uppercase tracking-widest">Processing Intelligence...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Query the system intelligence..."
              className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center active:scale-95 border border-slate-800"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
           Secure Neural Gateway • Verify AI Responses 
        </p>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] bg-white rounded-[40px] border border-slate-100 overflow-hidden items-center justify-center">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="mt-4 text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Initializing Neural Link...</p>
        </div>
      }>
        <ChatContent />
      </Suspense>
    </DashboardLayout>
  );
}
