"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import type { QuestionConfig, ActiveQuestion, UserAnswers } from "@/types/questionnaire";
import { getVisibleQuestions } from "@/lib/question-engine";
import QuestionRenderer from "./QuestionRenderer";

export default function QuestionnaireShell() {
  const router = useRouter();
  const [config, setConfig] = useState<QuestionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  // Fetch question config once
  useEffect(() => {
    fetch("/api/generate-questions")
      .then((r) => r.json())
      .then((data) => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Visible questions based on current answers
  const visible = useMemo<ActiveQuestion[]>(() => {
    if (!config) return [];
    return getVisibleQuestions(config, answers);
  }, [config, answers]);

  const current = visible[currentIdx];
  const totalSteps = visible.length;
  const progress = totalSteps > 0 ? ((currentIdx + 1) / totalSteps) * 100 : 0;
  const isLast = currentIdx >= totalSteps - 1;

  const handleAnswer = useCallback(
    (value: string | string[] | number) => {
      if (!current) return;
      const updated = { ...answers, [current.id]: value };
      setAnswers(updated);

      // Auto-advance on single_select (after short delay for visual feedback)
      if (current.inputType === "single_select" && !isLast) {
        setTimeout(() => setCurrentIdx((i) => Math.min(i + 1, totalSteps - 1)), 300);
      }
    },
    [current, answers, isLast, totalSteps]
  );

  const goBack = () => setCurrentIdx((i) => Math.max(0, i - 1));

  const goNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIdx((i) => Math.min(i + 1, totalSteps - 1));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      // Store results in sessionStorage for the results page
      sessionStorage.setItem("questionnaire_results", JSON.stringify(data));
      sessionStorage.setItem("questionnaire_answers", JSON.stringify(answers));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (current && answers[current.id] !== undefined) goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
          <p className="font-bold text-brand-600">Personalizing your experience...</p>
        </div>
      </div>
    );
  }

  if (!config || visible.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-600 to-indigo-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <header className="pt-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-brand-600">OneClickSathi</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secure & Encrypted
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Question number */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-black rounded-full">
                  {currentIdx + 1} / {totalSteps}
                </span>
                {current.category === "sector_branch" && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full flex items-center gap-1">
                    <Sparkles size={10} />
                    Sector-specific
                  </span>
                )}
              </div>

              {/* Question text */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-600 leading-tight">
                  {current.questionText}
                </h2>
                {current.subtitle && (
                  <p className="text-slate-500 mt-2 font-medium">{current.subtitle}</p>
                )}
              </div>

              {/* Input */}
              <QuestionRenderer
                question={current}
                value={answers[current.id]}
                onChange={handleAnswer}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentIdx === 0}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    currentIdx === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!answers[current.id] && current.required}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    !answers[current.id] && current.required
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : isLast
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                      : "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100"
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isLast ? (
                    <>
                      Get Recommendations
                      <Sparkles size={16} />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter ↵</kbd> to continue
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
