"use client";

import type { QuestionOption } from "@/types/questionnaire";
import { motion } from "framer-motion";

interface MultiSelectProps {
  options: QuestionOption[];
  value?: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelect({ options, value = [], onChange }: MultiSelectProps) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const selected = value.includes(opt.value);
        return (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`group flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              selected
                ? "border-brand-600 bg-brand-50 shadow-lg shadow-blue-100"
                : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
              selected ? "border-brand-600 bg-brand-600" : "border-slate-300"
            }`}>
              {selected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${selected ? "text-brand-700" : "text-brand-600"}`}>{opt.label}</p>
              {opt.description && <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
