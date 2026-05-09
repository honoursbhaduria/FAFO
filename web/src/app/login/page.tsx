"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, ArrowRight, Mail, ShieldCheck, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Logo = () => (
  <div className="flex flex-col items-center gap-4 group">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative bg-slate-900 p-4 rounded-3xl group-hover:rotate-6 transition-transform duration-500 shadow-2xl shadow-slate-900/20">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
    <span className="text-3xl font-black tracking-tight text-slate-900">
      OneClick<span className="text-blue-600">Sathi</span>
    </span>
  </div>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>

      <div className="w-full max-w-[480px] relative">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block hover:scale-[1.02] transition-transform active:scale-95">
            <Logo />
          </Link>
        </div>

        <motion.div 
          layout
          className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100/60 p-10 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h1>
              <p className="text-slate-500 font-medium mb-10">
                {isLogin 
                  ? "Access your business dashboard and schemes." 
                  : "Join 2,000+ Indian MSMEs growing with AI."}
              </p>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="Arjun Sharma"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      placeholder="arjun@business.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                    {isLogin && (
                      <button className="text-[11px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] mt-4">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-white px-6 text-slate-300">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]">
                  <Globe className="w-5 h-5" />
                  Google
                </button>
                <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]">
                  <User className="w-5 h-5" />
                  ID Account
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="text-center mt-10 text-slate-500 font-medium">
          {isLogin ? "New to OneClickSathi?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-black hover:underline ml-1"
          >
            {isLogin ? "Sign up for free" : "Log in here"}
          </button>
        </p>

        <div className="mt-16 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade Security</span>
          </div>
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  );
}
