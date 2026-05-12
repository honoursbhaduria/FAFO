"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  UserRound, 
  Bot, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Star,
  Zap,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ConsultantPage() {
  const [activeTab, setActiveTab] = useState<"AI" | "HUMAN">("AI");
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState<string | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.user) return;
        if (data.user.role === "CONSULTANT") {
          router.push("/consultant/dashboard");
          return;
        }
        setAuthUser(data.user);
      })
      .catch(() => null);
  }, [router]);

  useEffect(() => {
    if (activeTab === "HUMAN") {
      setIsLoading(true);
      fetch("/api/consultants")
        .then(res => res.json())
        .then(data => {
          setConsultants(data.consultants || []);
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const handleSchedule = async (consultantId?: string) => {
    if (!consultantId) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    setIsScheduling(consultantId);
    setScheduleMessage(null);

    try {
      const res = await fetch("/api/consultant-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");
      setScheduleMessage("Request sent to the CA. They will contact you soon.");
    } catch (err: any) {
      setScheduleMessage(err.message);
    } finally {
      setIsScheduling(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Expert Network</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Consultation Hub</h1>
            <p className="text-slate-500 font-medium">Access world-class financial expertise, powered by AI and human brilliance.</p>
          </div>
          
          <div className="flex p-1.5 bg-slate-100 rounded-[24px]">
            <button 
              onClick={() => setActiveTab("AI")}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'AI' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Bot size={18} className={activeTab === 'AI' ? "animate-bounce" : ""} />
              AI Assistant
            </button>
            <button 
              onClick={() => setActiveTab("HUMAN")}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'HUMAN' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <UserRound size={18} />
              Human Experts
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "AI" ? (
            <motion.div 
              key="ai-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Premium AI Assistant Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="group relative bg-brand-600 rounded-[40px] p-10 overflow-hidden border border-brand-500">
                  {/* Glowing Effects */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-600 rounded-full blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                        <Zap className="w-3 h-3 text-brand-500 fill-brand-500" />
                        <span className="text-[10px] font-black text-brand-100 uppercase tracking-widest">Available 24/7</span>
                      </div>
                      <h2 className="text-4xl font-black text-white leading-tight">Meet your AI <br /><span className="text-brand-500">Financial Sathi</span></h2>
                      <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">Analyze GSTR filings, audit balance sheets, and get instant compliance scores with our specialized LLM.</p>
                      <Link href="/ai" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-500 transition-all active:scale-95 group/btn">
                        Start AI Audit
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    <div className="shrink-0 relative">
                      <div className="absolute inset-0 bg-brand-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                      <div className="bg-brand-500 p-8 rounded-[40px] border border-white/10 relative z-10">
                        <Bot size={120} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "GST Health Audit", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Scan recent GSTR-1 & 3B for errors." },
                    { title: "Document Analysis", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Extract insights from complex tax notices." }
                  ].map((feat) => (
                    <div key={feat.title} className="bg-white p-8 rounded-[32px] border border-slate-100 hover:-translate-y-1 transition-all cursor-pointer group">
                      <div className={`${feat.bg} ${feat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <feat.icon size={28} />
                      </div>
                      <h3 className="font-black text-brand-600 text-xl mb-2">{feat.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100">
                  <h3 className="font-black text-brand-600 mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-brand-600" />
                    History
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yesterday</p>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">94 Score</span>
                      </div>
                      <p className="text-sm font-bold text-brand-500">GST Compliance Check</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Oct 12</p>
                      <p className="text-sm font-bold text-brand-500">P&L Analysis Report</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-600 p-8 rounded-[32px] text-white space-y-6">
                  <h4 className="font-black text-xl">Sathi Premium AI</h4>
                  <ul className="space-y-3">
                    {["Unlimited Audits", "Unlimited Tax Filing Assist", "Custom AI Prompts"].map(u => (
                      <li key={u} className="flex items-center gap-2 text-sm font-bold text-brand-100">
                        <CheckCircle2 className="w-4 h-4" />
                        {u}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-4 bg-white text-brand-600 font-black rounded-2xl hover:bg-brand-50 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="human-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scheduleMessage && (
                  <div className="md:col-span-2 lg:col-span-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-600">
                    {scheduleMessage}
                  </div>
                )}
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[40px] border border-slate-100 h-[400px] animate-pulse" />
                  ))
                ) : consultants.length > 0 ? (
                  consultants.map((ca, idx) => (
                    <motion.div 
                      key={ca.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500"
                    >
                      <div className="p-8">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="relative">
                            <div className="w-20 h-20 bg-brand-50 rounded-[24px] flex items-center justify-center text-brand-600 text-2xl font-black">
                              {ca.user?.name?.substring(0, 2).toUpperCase() || "CA"}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${ca.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          </div>
                          <div>
                            <h3 className="font-black text-brand-600 text-xl">{ca.user?.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                              <span className="text-sm font-black text-brand-600">{ca.rating.toFixed(1)}</span>
                              <span className="text-slate-400 text-sm font-medium">({ca.reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed line-clamp-3">
                          {ca.bio}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                            <p className="font-black text-brand-600">{ca.experience} Yrs</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting</p>
                            <p className="font-black text-brand-600">{ca.hourlyRate || "₹999/session"}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSchedule(ca.userId || ca.user?.id)}
                          disabled={isScheduling === (ca.userId || ca.user?.id)}
                          className="w-full py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-60"
                        >
                          {isScheduling === (ca.userId || ca.user?.id) ? "Sending..." : "Schedule Consultation"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 bg-white p-20 rounded-[40px] border border-slate-100 text-center">
                    <UserRound size={48} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-black text-slate-400">No Experts Available Yet</h3>
                    <p className="text-slate-400 font-medium mt-2">Check back soon or apply to become an expert!</p>
                  </div>
                )}
                
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center text-center group hover:border-brand-600 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                    <Plus size={32} />
                  </div>
                  <h4 className="font-black text-brand-600 text-lg">Are you a CA?</h4>
                  <p className="text-sm text-slate-500 font-medium mt-2 max-w-[200px]">Join our network and help 28,000+ MSMEs grow.</p>
                  <Link href="/login?mode=register&role=consultant" className="mt-6 text-sm font-black text-brand-600 uppercase tracking-widest hover:underline">Apply Now</Link>
                </div>
              </div>

              {/* Trust Bar */}
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-black text-brand-600 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500 w-8 h-8" />
                    Verified Excellence
                  </h3>
                  <p className="text-slate-500 font-medium">All our CAs undergo a rigorous 4-step verification process including ICAI credentials check.</p>
                </div>
                <div className="flex gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                  <span className="text-xl font-black text-brand-600">ICAI Verified</span>
                  <span className="text-xl font-black text-brand-600">100% Secure</span>
                  <span className="text-xl font-black text-brand-600">Data Encrypted</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

