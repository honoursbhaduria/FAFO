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
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Start Questionnaire
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              Your Matched Schemes
            </h1>
            <p className="text-slate-500 mt-1">
              {results.totalMatched} schemes matched your profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/questionnaire")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              <RotateCw size={14} />
              Retake
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
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
