"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { ArrowRight, ArrowLeft, Building2, Briefcase, Rocket, ShieldCheck, Globe, Users, Target, Zap, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    id: "stage",
    title: "What's your business stage?",
    subtitle: "We'll tailor your experience based on where you are.",
    options: [
      { label: "Ideation", description: "Just an idea or planning phase", icon: Rocket, color: "text-purple-600", bg: "bg-purple-50", border: "hover:border-purple-600" },
      { label: "Startup", description: "Launched and operational (< 2 years)", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-600" },
      { label: "Established", description: "Growing business (> 2 years)", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-600" },
    ]
  },
  {
    id: "sector",
    title: "Which sector do you operate in?",
    subtitle: "This helps us find industry-specific subsidies.",
    options: [
      { label: "Agriculture", description: "Farming, dairy, or food processing", icon: Globe, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-600" },
      { label: "Technology", description: "Software, IT, or digital services", icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50", border: "hover:border-indigo-600" },
      { label: "Manufacturing", description: "Factories, tools, or production", icon: Target, color: "text-red-600", bg: "bg-red-50", border: "hover:border-red-600" },
      { label: "Service", description: "Consulting, retail, or logistics", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50", border: "hover:border-cyan-600" },
    ]
  }
];

export default function BusinessPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: option });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push(`/dashboard?onboarding=complete`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      
      {/* Background Illustrations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 -z-10 skew-x-12 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 -z-10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

      <main className="flex-1 flex items-center justify-center pt-32 pb-12 px-6">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left side: Context & Progress */}
            <div className="lg:col-span-4 space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sathi Onboarding</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Let's map your <span className="text-blue-600">journey.</span>
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                  To provide the most relevant schemes and CA experts, we need to understand the heartbeat of your business.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      i === currentStep 
                        ? "bg-slate-900 text-white scale-125 shadow-xl shadow-slate-200" 
                        : i < currentStep ? "bg-blue-600 text-white" : "bg-white text-slate-300 border border-slate-200"
                    }`}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm font-bold transition-all ${i === currentStep ? "text-slate-900" : "text-slate-400"}`}>
                      {step.title.split('?')[0]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">100% Secure</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Encrypted with Bank-grade Security</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your information is used only to match you with eligible government programs and authorized professionals.
                </p>
              </div>
            </div>

            {/* Right side: Options */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">
                        {steps[currentStep].title}
                      </h2>
                      <p className="text-slate-500 font-medium italic">
                        "{steps[currentStep].subtitle}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {steps[currentStep].options.map((option, idx) => (
                        <button
                          key={option.label}
                          onClick={() => handleSelect(option.label)}
                          className={`group relative flex items-start gap-5 p-6 bg-slate-50/50 border-2 border-transparent rounded-3xl text-left hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 ${option.border}`}
                        >
                          <div className={`${option.bg} ${option.color} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <option.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 mb-1">
                              {option.label}
                            </h3>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                          <div className="ml-auto mt-2">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-600 group-hover:bg-blue-600 transition-all flex items-center justify-center">
                              <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentStep > 0 && (
                    <button 
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors ml-4"
                    >
                      <ArrowLeft size={18} />
                      Previous Step
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

