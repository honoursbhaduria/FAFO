"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Zap, CheckCircle2, ShieldCheck, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// --- DATA ---
const stackItems = [
  { 
    id: 1, 
    title: "AUTOMATED FILINGS", 
    desc: "Tax and regulatory filings handled by AI while you sleep.", 
    img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1600&q=80",
    color: "#f8fafc" // brand-50
  },
  { 
    id: 2, 
    title: "SCHEME DISCOVERY", 
    desc: "Instantly find government grants you didn't know existed.", 
    img: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1600&q=80",
    color: "#f1f5f9" // brand-100
  },
  { 
    id: 3, 
    title: "COMPLIANCE TRACKER", 
    desc: "A live roadmap of every deadline for your specific location.", 
    img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80",
    color: "#ffffff" 
  },
];

const hoverFeatures = [
  { id: 1, title: "GST & Tax Prep", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "MSME Registration", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Audit Automation", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" },
];

export default function ModernLanding() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const stackRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. LENIS SMOOTH SCROLL
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. GSAP STACKING ANIMATION (Horizontal Scroll Lock)
    const cards = gsap.utils.toArray(".stack-card");
    
    if (stackRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stackRef.current,
            start: "top top",
            end: `+=${cards.length * 100}%`,
            pin: true,
            scrub: 1,
          }
        });
    
        cards.forEach((card: any, i) => {
          if (i === 0) return;
          tl.fromTo(card, 
            { x: "100%", rotate: 5 }, 
            { x: "0%", rotate: 0, ease: "none" }, 
            i 
          );
        });
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="bg-white text-brand-600 font-sans selection:bg-brand-600 selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex items-center px-[8%] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-50">
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-100 rounded-full blur-[150px]" />
            <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                Trusted by 28,000+ MSMEs across India
              </span>
          </div>

          <h1 className="text-[clamp(4rem,12vw,12rem)] font-black leading-[0.85] tracking-tighter m-0 uppercase">
            SCALE <br />
            <span className="text-slate-300">SAFE.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-end gap-12 mt-12">
            <p className="text-xl md:text-2xl text-slate-500 max-w-[500px] font-medium leading-tight">
              The first automated compliance engine <br />
              built for the next generation of <br />
              <span className="text-brand-600 font-bold italic underline decoration-brand-600/20">Indian Enterprise.</span>
            </p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <Link 
                href="/dashboard" 
                className="flex items-center justify-center gap-2 px-8 py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-2xl shadow-brand-600/20 active:scale-95 group"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative stats */}
        <div className="absolute right-[8%] bottom-[15%] hidden lg:block">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400">GST Ready</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400">ISO Certified</span>
                </div>
                <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400">4.9/5 Rating</span>
                </div>
            </div>
        </div>
      </section>

      {/* --- STACKING CARDS (GSAP) --- */}
      <section ref={stackRef} className="h-screen relative overflow-hidden bg-brand-600">
        {stackItems.map((item, i) => (
          <div 
            key={item.id} 
            className="stack-card absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: item.color, zIndex: i }}
          >
            <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale hover:grayscale-0 transition-all duration-1000" alt={item.title} />
            <div className="relative z-10 text-center px-6">
              <h2 className="text-[clamp(2.5rem,10vw,8rem)] font-black m-0 leading-tight tracking-tighter uppercase text-brand-600">
                {item.title}
              </h2>
              <p className="text-xl md:text-2xl mt-4 font-bold text-slate-500 max-w-2xl mx-auto uppercase tracking-wide">
                {item.desc}
              </p>
            </div>
            {/* Bottom identifier */}
            <div className="absolute bottom-12 left-12 flex items-center gap-4">
                <span className="text-6xl font-black text-brand-600/10">0{item.id}</span>
                <div className="h-[1px] w-24 bg-brand-600/20" />
            </div>
          </div>
        ))}
      </section>

      {/* --- HOVER IMAGE REVEAL SECTION --- */}
      <section className="py-[15%] px-[8%] relative bg-white">
        <h2 className="text-sm font-black text-slate-300 tracking-[0.3em] mb-16 uppercase">
          CAPABILITIES
        </h2>
        <div className="relative z-10">
          {hoverFeatures.map((item, index) => (
            <div 
              key={item.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="py-12 border-b border-slate-100 cursor-pointer group flex items-center justify-between"
            >
              <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black m-0 group-hover:translate-x-8 transition-transform duration-500 uppercase leading-none">
                {item.title}
              </h3>
              <ArrowRight className="w-12 h-12 text-slate-100 group-hover:text-brand-600 transition-colors duration-500 -rotate-45 group-hover:rotate-0" />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/4 right-[10%] w-[35vw] h-[55vh] pointer-events-none z-50 overflow-hidden rounded-[40px] shadow-[0_50px_100px_-20px_rgba(28,37,54,0.3)] border-8 border-white"
            >
              <img src={hoverFeatures[hoveredIndex].img} className="w-full h-full object-cover" alt="Capability" />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- MARQUEE --- */}
      <div className="py-16 bg-brand-600 text-white overflow-hidden flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="text-3xl font-black uppercase tracking-tighter flex gap-8 shrink-0 items-center"
        >
          {Array(15).fill(null).map((_, i) => (
              <React.Fragment key={i}>
                <span>GOVT SCHEMES ACCESSED</span>
                <Zap className="w-6 h-6 fill-current text-amber-400" />
                <span>ONE-CLICK FILING</span>
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span>AI EXPERT CONSULTING</span>
                <span className="w-3 h-3 rounded-full bg-white/20" />
              </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* --- CTA SECTION --- */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <h2 className="text-[clamp(3rem,10vw,8rem)] font-black leading-[0.85] tracking-tighter mb-16 uppercase max-w-5xl">
            Ready to <br />
            <span className="text-slate-200">Scale Safely?</span>
        </h2>
        <Link 
          href="/login?mode=register"
          className="px-12 py-6 bg-brand-600 text-white rounded-full font-black text-xl hover:scale-105 hover:bg-brand-700 transition-all shadow-2xl shadow-brand-600/20 active:scale-95"
        >
          LAUNCH ASSISTANT
        </Link>
        <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-xs">
            Start free • No credit card required • GDPR Compliant
        </p>
      </section>
    </div>
  );
}
