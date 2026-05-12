"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Bot, ChevronDown, ExternalLink, Tag, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Scheme {
  title: string;
  summary: string;
  url: string;
  category: string;
}

interface ChatMessage {
  role: string;
  content: string;
  type?: string;
  schemes?: Scheme[];
}

// Compact scheme card for the floating bot
function MiniSchemeCard({ scheme }: { scheme: Scheme }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border border-border bg-card transition-all cursor-pointer overflow-hidden mt-1"
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
    >
      <div className="h-0.5 w-full bg-border" />
      <div className="p-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Landmark className="w-3 h-3 text-brand-600 dark:text-brand-500 flex-shrink-0" />
            <span className="text-[10px] font-bold text-foreground truncate">{scheme.title}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
          </motion.div>
        </div>
        <span className="inline-flex items-center gap-1 mt-0.5 px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
          <Tag className="w-1.5 h-1.5" />
          {scheme.category}
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[9px] text-muted-foreground mt-1 leading-snug">
                {scheme.summary.length > 150 ? scheme.summary.substring(0, 150) + "..." : scheme.summary}
              </p>
              <a
                href={scheme.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-brand-600 dark:text-brand-400 hover:opacity-80"
              >
                <ExternalLink className="w-2 h-2" />
                Wikipedia
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SathiBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Namaste! I am your OneClickSathi. How can I help your business grow today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chat/history");
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m: any) => ({
            role: m.role === "model" ? "assistant" : m.role,
            content: m.content,
            type: m.type,
            schemes: m.schemes as Scheme[] || undefined,
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to delete your chat history?")) return;
    try {
      const res = await fetch("/api/ai/chat/history", { method: "DELETE" });
      if (res.ok) {
        setMessages([
          { role: "assistant", content: "Namaste! I am your OneClickSathi. How can I help your business grow today?" }
        ]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        })
      });
      const data = await res.json();
      setMessages([...newMessages, { 
        role: "assistant", 
        content: data.text || "Sorry, I am having trouble connecting right now.",
        type: data.type,
        schemes: data.schemes,
      }]);
    } catch (err) {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Network error occurred." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[380px] h-[560px] bg-card rounded-[32px] border border-border overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-brand-600 dark:bg-brand-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">OneClick Sathi</h4>
                  <p className="text-[10px] text-white/60 font-medium tracking-tight">Your Business Growth Partner</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  title="Clear Chat History"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex flex-col`}>
                    <div className={`p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-brand-600 text-white rounded-tr-none" 
                        : "bg-card text-foreground border border-border rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                    {/* Scheme cards */}
                    {msg.type === "schemes" && msg.schemes && msg.schemes.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {msg.schemes.slice(0, 4).map((scheme, idx) => (
                          <MiniSchemeCard key={idx} scheme={scheme} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl text-sm bg-card text-muted-foreground border border-border rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    Searching...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t border-border">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about schemes, GST, or CA..."
                  className="w-full pl-4 pr-12 py-3.5 bg-muted border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-600 outline-none transition-all placeholder:text-muted-foreground text-foreground"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-colors relative group shadow-xl"
      >
        <div className="absolute inset-0 bg-brand-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
        <div className="relative">
          {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 fill-current" />}
        </div>
      </motion.button>
    </div>
  );
}
