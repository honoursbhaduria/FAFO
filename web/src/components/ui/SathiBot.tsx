"use client";

import { useState, useRef, useEffect } from "react";
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
      className="rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer overflow-hidden mt-1.5"
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-60" />
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Landmark className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-brand-500 truncate">{scheme.title}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </motion.div>
        </div>
        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600">
          <Tag className="w-2 h-2" />
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
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                {scheme.summary.length > 150 ? scheme.summary.substring(0, 150) + "..." : scheme.summary}
              </p>
              <a
                href={scheme.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-brand-600 hover:text-brand-700"
              >
                <ExternalLink className="w-2.5 h-2.5" />
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
            className="absolute bottom-20 right-0 w-[380px] h-[560px] bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">OneClick Sathi</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Expert Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex flex-col`}>
                    <div className={`p-3.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-100" 
                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
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
                  <div className="p-3.5 rounded-2xl text-sm bg-white text-slate-500 border border-slate-200 rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    Searching schemes...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about schemes, GST, or CA..."
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-600" />
                Powered by OneClick AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-brand-600 transition-colors relative group"
      >
        <div className="absolute inset-0 bg-brand-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
        <div className="relative">
          {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 fill-current" />}
        </div>
      </motion.button>
    </div>
  );
}
