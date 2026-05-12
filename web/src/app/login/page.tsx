"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight, Mail, ShieldCheck, Globe, Loader2, CheckCircle2, Bot, Landmark, Briefcase, FileText, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Logo = () => (
  <div className="flex items-center group">
    <span 
      className="text-2xl font-black tracking-tight text-brand-600"
      style={{ fontFamily: 'var(--font-logo-alt)' }}
    >
      OneClickSathi
    </span>
  </div>
);

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? false : true;
  const isConsultantSignup = searchParams.get("role") === "consultant";
  
  const [isLogin, setIsLogin] = useState(initialMode);
  const [isCaMode, setIsCaMode] = useState(isConsultantSignup);
  const [caStep, setCaStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isConsultantSignup) {
      setIsLogin(false);
      setIsCaMode(true);
    }
  }, [isConsultantSignup]);

  // Basic info states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // CA specific states
  const [caProfile, setCaProfile] = useState({
    title: "Chartered Accountant",
    specialization: ["Taxation", "GST"],
    experience: "5",
    qualification: "",
    licenseNumber: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
    hourlyRate: "₹999/session",
  });

  const [documents, setDocuments] = useState<{name: string, file: File | null, type: string}[]>([
    { name: "Aadhaar Card", file: null, type: "ID_PROOF" },
    { name: "ICAI Certificate", file: null, type: "QUALIFICATION" },
    { name: "PAN Card", file: null, type: "PAN" },
  ]);

  const handleCaProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCaProfile({ ...caProfile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const newDocs = [...documents];
    newDocs[index].file = file;
    setDocuments(newDocs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCaMode && caStep < 4) {
      setCaStep(caStep + 1);
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // 1. Register the user and get token
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { email, password } 
        : { 
            name, 
            email, 
            password, 
            role: isCaMode ? "CONSULTANT" : "USER",
            consultantProfile: isCaMode ? caProfile : null
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Something went wrong");
      }

      // 2. If CA mode and registration successful, upload documents
      if (!isLogin && isCaMode) {
        for (const doc of documents) {
          if (doc.file) {
            const formData = new FormData();
            formData.append("file", doc.file);
            formData.append("type", doc.type);
            
            await fetch("/api/documents", {
              method: "POST",
              body: formData,
              // Note: Auth cookie should be sent automatically since it was set by /register
            });
          }
        }
      }

      const role = data?.user?.role;

      if (isLogin) {
        router.push(role === "CONSULTANT" ? "/consultant/dashboard" : "/dashboard");
      } else {
        router.push(isCaMode ? "/consultant/dashboard" : "/questionnaire");
      }
    } catch (err: any) {
      setError(err.message);
      if (isCaMode) setCaStep(1); // Reset to first step on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="mb-12">
          <Link href="/" className="inline-block hover:scale-[1.02] transition-transform active:scale-95">
            <Logo />
          </Link>
        </div>

        <div className="max-w-[480px] w-full mx-auto lg:mx-0 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : isCaMode ? `ca-reg-${caStep}` : "register"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-black text-brand-600 mb-3 tracking-tight">
                {isLogin ? "Welcome Back" : isCaMode ? `CA Registration (Step ${caStep}/4)` : "Create Account"}
              </h1>
              <p 
                className="text-slate-500 font-medium mb-10 leading-relaxed"
                style={{ fontFamily: 'var(--font-logo-alt)' }}
              >
                {isLogin 
                  ? "Access your business dashboard and discover new schemes." 
                  : isCaMode 
                    ? "Register as an expert to help MSMEs grow."
                    : "Join thousands of entrepreneurs growing with AI-powered insights."}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Step 1: Basic Info (Same for everyone) */}
                {(!isLogin && (!isCaMode || caStep === 1)) && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        {!isCaMode && <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />}
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Arjun Sharma"
                          className={`w-full ${!isCaMode ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Login or Step 1 Email/Pass */}
                {((isLogin) || (!isLogin && (!isCaMode || caStep === 1))) && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        {!isCaMode && <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />}
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="arjun@business.com"
                          className={`w-full ${!isCaMode ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                      </div>
                      <div className="relative group">
                        {!isCaMode && <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />}
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full ${!isCaMode ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* CA Step 2: Professional Details */}
                {!isLogin && isCaMode && caStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License / Registration Number</label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="licenseNumber"
                          required
                          value={caProfile.licenseNumber}
                          onChange={handleCaProfileChange}
                          placeholder="ICAI-123456"
                          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualification</label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="qualification"
                          required
                          value={caProfile.qualification}
                          onChange={handleCaProfileChange}
                          placeholder="FCA, B.Com"
                          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization (comma separated)</label>
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          value={caProfile.specialization.join(", ")}
                          onChange={(e) => setCaProfile({...caProfile, specialization: e.target.value.split(",").map(s => s.trim())})}
                          placeholder="Taxation, GST, Audit"
                          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Years of Experience</label>
                      <div className="relative group">
                        <input
                          type="number"
                          name="experience"
                          required
                          value={caProfile.experience}
                          onChange={handleCaProfileChange}
                          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CA Step 3: Contact and Bio */}
                {!isLogin && isCaMode && caStep === 3 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={caProfile.phone}
                          onChange={handleCaProfileChange}
                          placeholder="+91 98765 43210"
                          className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hourly Rate</label>
                        <input
                          type="text"
                          name="hourlyRate"
                          required
                          value={caProfile.hourlyRate}
                          onChange={handleCaProfileChange}
                          placeholder="₹999/session"
                          className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="location"
                          required
                          value={caProfile.location}
                          onChange={handleCaProfileChange}
                          placeholder="Mumbai, Maharashtra"
                          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                      <textarea
                        name="bio"
                        required
                        value={caProfile.bio}
                        onChange={handleCaProfileChange}
                        placeholder="Tell MSMEs how you can help them..."
                        className="w-full p-4 min-h-[100px] bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-medium text-brand-600 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                )}

                {/* CA Step 4: Documents */}
                {!isLogin && isCaMode && caStep === 4 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 font-medium mb-4">Please upload the following documents for verification.</p>
                    
                    {documents.map((doc, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.name}</label>
                        <div className="relative group">
                          <input
                            type="file"
                            required
                            onChange={(e) => handleFileChange(idx, e)}
                            className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-600 outline-none transition-all font-medium text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-2">
                        Security Note
                      </p>
                      <p className="text-xs text-amber-600/80 mt-1">Your documents are encrypted and only used for identity verification by our internal compliance team.</p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-600 -600/10 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : isCaMode ? (caStep === 4 ? "Complete Registration" : "Next Step") : "Create Account"}
                      {!isCaMode && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </>
                  )}
                </button>
              </form>


              {(!isCaMode || isLogin) && (
                <>
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
                    <button 
                      onClick={() => {
                        setIsLogin(false);
                        setIsCaMode(true);
                        setCaStep(1);
                      }}
                      className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                    >
                      CA/Expert
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-10">
          <p className="text-slate-500 font-medium">
            {isLogin ? "New to OneClickSathi?" : "Already have an account?"}{" "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setIsCaMode(false);
                setCaStep(1);
                setError("");
              }}
              className="text-brand-600 font-black hover:underline ml-1"
            >
              {isLogin ? "Sign up for free" : "Log in here"}
            </button>
          </p>
          <div className="mt-8 flex items-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
              {!isCaMode && <ShieldCheck className="w-4 h-4" />}
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
