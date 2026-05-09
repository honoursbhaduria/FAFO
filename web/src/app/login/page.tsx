"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight, Mail, ShieldCheck, Globe, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Logo = () => (
  <div className="flex items-center gap-3 group">
    <div className="relative">
      <div className="absolute inset-0 bg-brand-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative bg-brand-600 p-2.5 rounded-2xl group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-brand-600/20">
        <svg
          width="24"
          height="24"
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
    <span className="text-2xl font-black tracking-tight text-brand-600">
      OneClick<span className="text-brand-600">Sathi</span>
    </span>
  </div>
);

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Something went wrong");
      }

      // Success
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 lg:p-20">
        <div className="mb-12">
          <Link href="/" className="inline-block hover:scale-[1.02] transition-transform active:scale-95">
            <Logo />
          </Link>
        </div>

        <div className="max-w-[440px] w-full mx-auto lg:mx-0 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-black text-brand-600 mb-3 tracking-tight">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                {isLogin 
                  ? "Access your business dashboard and discover new schemes." 
                  : "Join thousands of entrepreneurs growing with AI-powered insights."}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Arjun Sharma"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="arjun@business.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-black text-brand-600 uppercase tracking-tight hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-600 shadow-xl shadow-brand-600/10 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
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
        </div>

        <div className="mt-auto pt-10">
          <p className="text-slate-500 font-medium">
            {isLogin ? "New to OneClickSathi?" : "Already have an account?"}{" "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-brand-600 font-black hover:underline ml-1"
            >
              {isLogin ? "Sign up for free" : "Log in here"}
            </button>
          </p>
          <div className="mt-8 flex items-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade Security</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 Certified</span>
          </div>
        </div>
      </div>

      {/* Right Side: Image / Branding */}
      <div className="hidden lg:block lg:w-1/2 relative bg-brand-600 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-600 via-brand-600/20 to-transparent" />
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          alt="Modern office" 
          className="absolute inset-0 object-cover w-full h-full opacity-60 scale-105 hover:scale-100 transition-transform duration-[10s]"
        />
        
        <div className="absolute bottom-20 left-20 right-20 z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-12 h-1.5 rounded-full bg-brand-600/30 overflow-hidden">
                  {i === 0 && <div className="h-full bg-brand-500 w-full animate-[progress_3s_ease-in-out_infinite]" />}
                </div>
              ))}
            </div>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Fueling the next generation of <span className="text-brand-500">Indian Enterprise.</span>
            </h2>
            <div className="space-y-4">
              {[
                "Instant eligibility checks for 4,000+ schemes",
                "AI-powered compliance management",
                "Secure document vault with bank-grade encryption"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-[-5%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
