"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RecommendationList from "@/components/results/RecommendationList";
import { ArrowLeft, Sparkles, RotateCw } from "lucide-react";
import type { RecommendationResponse } from "@/types/questionnaire";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("questionnaire_results");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  if (!results) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center space-y-4">
          <p className="font-bold text-slate-600">No results found</p>
          <p className="text-sm text-slate-400">Complete the questionnaire first.</p>
          <button
            onClick={() => router.push("/questionnaire")}
            className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all"
          >
            Start Questionnaire
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Matches</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              {results.totalMatched} schemes matched your business profile via neural analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/questionnaire")}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
            >
              <RotateCw size={14} />
              Retake Analysis
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              Dashboard
            </button>
          </div>
        </div>

        <RecommendationList
          schemes={results.schemes}
          filtersApplied={results.filtersApplied}
          queryTime={results.queryTime}
        />
      </div>
    </DashboardLayout>
  );
}
