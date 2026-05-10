"use client";

import { ExternalLink, Bookmark, Share2, Calendar, Sparkles, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SchemeInsight {
  summary: string;
  keyBenefits: string[];
  hiddenEligibility: string[];
  importantDeadlines: string[];
  commonMistakes: string[];
  whoShouldApply: string[];
  warnings: string[];
  recommendations: string[];
}

interface SchemeSidebarProps {
  schemeName: string;
  externalUrl?: string;
  apiId: string;
}

export default function SchemeSidebar({ schemeName, externalUrl, apiId }: SchemeSidebarProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [insights, setInsights] = useState<SchemeInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightError, setInsightError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/schemes/save")
      .then(res => res.json())
      .then(data => {
        if (data.saved) {
          setIsSaved(data.saved.some((s: any) => s.schemeId === apiId));
        }
      })
      .catch(err => console.error(err));
  }, [apiId]);

  // Fetch dynamic insights for this specific scheme
  useEffect(() => {
    setInsightLoading(true);
    setInsightError(false);
    setInsights(null);
    setExpanded(false);

    fetch(`/api/schemes/insights?schemeId=${encodeURIComponent(apiId)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch insights");
        return res.json();
      })
      .then(data => {
        if (data.insights) {
          setInsights(data.insights);
        } else {
          setInsightError(true);
        }
      })
      .catch(err => {
        console.error("Insight fetch error:", err);
        setInsightError(true);
      })
      .finally(() => setInsightLoading(false));
  }, [apiId]);

  const handleApplyClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://www.myscheme.gov.in/search`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await fetch(`/api/schemes/save?schemeId=${apiId}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await fetch("/api/schemes/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId: apiId, schemeName }),
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: schemeName,
      text: `Check out this government scheme: ${schemeName}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyTooltip(true);
        setTimeout(() => setShowCopyTooltip(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Helper to render insight sections
  const renderInsightSection = (title: string, items: string[], emoji: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1.5">
          <span>{emoji}</span> {title}
        </h5>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-brand-100 text-xs font-medium leading-relaxed flex items-start gap-2">
              <span className="text-white/40 mt-0.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="sticky top-32 space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="space-y-4">
          <button 
            onClick={handleApplyClick}
            className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-2xl shadow-brand-600/10 flex items-center justify-center gap-3 group transition-all active:scale-95"
          >
            {externalUrl ? "Apply Now" : "Apply via MyScheme"}
            <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleSave}
              className={`flex items-center justify-center gap-2 py-4 border rounded-2xl font-bold text-sm transition-all ${
                isSaved 
                  ? "bg-brand-50 border-blue-200 text-brand-600" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
              {isSaved ? "Saved" : "Save"}
            </button>
            <div className="relative">
              <button 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
              {showCopyTooltip && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                  Link Copied!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 text-amber-600 mb-4 font-black text-xs uppercase tracking-widest">
            <Calendar size={16} />
            Application Timeline
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Most applications for this scheme are processed within 30-45 business days after submission of all documents.
          </p>
        </div>
      </div>

      {/* AI Quick Insight — Dynamic */}
      <div className="bg-gradient-to-br from-indigo-600 via-brand-700 to-brand-600 p-8 rounded-[32px] shadow-2xl shadow-brand-500/20 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-white/80" size={24} />
            <h4 className="font-black uppercase tracking-widest text-sm">AI Quick Insight</h4>
          </div>

          {/* Loading State */}
          {insightLoading && (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
              <p className="text-brand-100 font-medium text-sm">
                Analyzing scheme details...
              </p>
            </div>
          )}

          {/* Error State */}
          {insightError && !insightLoading && (
            <p className="text-brand-100 leading-relaxed mb-8 font-medium italic">
              &quot;Unable to generate insights at this time. Click below to ask our AI assistant about this scheme.&quot;
            </p>
          )}

          {/* Dynamic Insight Content */}
          {insights && !insightLoading && (
            <>
              {/* Summary — always shown */}
              <p className="text-brand-100 leading-relaxed mb-6 font-medium italic">
                &quot;{insights.summary}&quot;
              </p>

              {/* Expandable detailed insights */}
              {expanded && (
                <div className="border-t border-white/10 pt-5 mt-2 space-y-1">
                  {renderInsightSection("Key Benefits", insights.keyBenefits, "✅")}
                  {renderInsightSection("Hidden Requirements", insights.hiddenEligibility, "🔍")}
                  {renderInsightSection("Important Deadlines", insights.importantDeadlines, "📅")}
                  {renderInsightSection("Common Mistakes", insights.commonMistakes, "⚠️")}
                  {renderInsightSection("Who Should Apply", insights.whoShouldApply, "🎯")}
                  {renderInsightSection("Warnings", insights.warnings, "🚨")}
                  {renderInsightSection("Recommendations", insights.recommendations, "💡")}
                </div>
              )}

              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest mt-4 mb-4 transition-colors"
              >
                {expanded ? (
                  <>
                    Show Less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    View Full Analysis <ChevronDown size={14} />
                  </>
                )}
              </button>
            </>
          )}

          <Link 
            href={`/ai?q=${encodeURIComponent(schemeName)}`} 
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-lg text-sm"
          >
            ASK AI MORE
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Sparkles size={200} />
        </div>
      </div>
    </div>
  );
}
