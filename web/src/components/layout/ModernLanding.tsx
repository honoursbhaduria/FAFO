"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Zap, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { useTheme } from "next-themes";

gsap.registerPlugin(ScrollTrigger);

// --- DATA ---
const stackItems = [
  { 
    id: 1, 
    title: "AUTOMATED FILINGS", 
    desc: "Tax and regulatory filings handled by AI while you sleep.", 
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80",
    color: "#ffffff",
    darkColor: "#0f172a"
  },
  { 
    id: 2, 
    title: "SCHEME DISCOVERY", 
    desc: "Instantly find government grants you didn't know existed.", 
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    color: "#ffffff",
    darkColor: "#1e293b"
  },
  { 
    id: 3, 
    title: "COMPLIANCE TRACKER", 
    desc: "A live roadmap of every deadline for your specific location.", 
    img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1600&q=80",
    color: "#ffffff",
    darkColor: "#0f172a",
    features: ["GST Filing - 20th May", "MSME Renewal - 15th June", "Audit Prep - 30th June"]
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
  const lenisRef = useRef<Lenis | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. LENIS SMOOTH SCROLL
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

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
            id: "stack-trigger",
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
            { 
              y: "100%", 
              rotate: 10,
              scale: 0.9,
              opacity: 0.5
            }, 
            { 
              y: "0%", 
              rotate: 0, 
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              delay: 0.1
            }, 
            i 
          );
        });
    }

    // 3. Click to Advance Logic
    const handleCardClick = (index: number) => {
      if (!stackRef.current) return;
      const totalHeight = ScrollTrigger.getById("stack-trigger")?.end || 0;
      const startPos = ScrollTrigger.getById("stack-trigger")?.start || 0;
      const scrollStep = (totalHeight - startPos) / stackItems.length;
      
      const targetScroll = startPos + (index + 1) * scrollStep;
      
      // If it's the last card, scroll past the section
      if (index === stackItems.length - 1) {
        window.scrollTo({
          top: totalHeight + 200,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: "smooth"
        });
      }
    };

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex items-center px-[8%] relative overflow-hidden isolate">
        {/* Video Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover scale-105"
          >
            <source src="/herosectionvideo.mp4?v=20260510" type="video/mp4" />
          </video>
          {/* Subtle dark overlay only in dark mode */}
          <div className="absolute inset-0 hidden dark:block bg-black/40" />
          {/* Very subtle gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-[clamp(3rem,10vw,10rem)] font-black leading-[0.85] tracking-tighter m-0 uppercase text-white">
            SCALE <br />
            <span className="text-white/80">SAFE.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-end gap-12 mt-12">
            <p className="text-lg md:text-xl text-white/90 max-w-[500px] font-semibold leading-tight">
              The first automated compliance engine <br />
              built for the next generation of <br />
              <span className="text-white font-bold italic underline decoration-white/30">Indian Enterprise.</span>
            </p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <Link href="/dashboard" className="group relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
                  className="absolute inset-0 bg-white/20 -m-2 blur-xl rounded-full group-hover:bg-white/30 transition-all"
                />
                <div 
                  className="relative flex items-center justify-center gap-4 px-10 py-5 bg-foreground text-background font-bold text-lg overflow-hidden transition-all duration-500 hover:gap-6"
                  style={{ 
                    fontFamily: 'var(--font-logo)',
                    clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)"
                  }}
                >
                  {/* Glint Effect */}
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-600/10 to-transparent skew-x-12"
                  />
                  
                  <span className="relative z-10 tracking-tight">Access Dashboard</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Background Animation */}
                  <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative stats */}
        <div className="absolute right-[8%] bottom-[15%] hidden lg:hidden">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/80">GST Ready</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/80">ISO Certified</span>
                </div>
                <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/80">4.9/5 Rating</span>
                </div>
            </div>
        </div>
      </section>

      {/* --- STACKING CARDS (GSAP) --- */}
      <section ref={stackRef} className="h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl max-h-[70vh] flex items-center justify-center">
          {stackItems.map((item, i) => (
            <div 
              key={item.id} 
              onClick={() => {
                if (!lenisRef.current) return;
                
                const st = ScrollTrigger.getById("stack-trigger");
                if (!st) return;

                const startPos = st.start;
                const endPos = st.end;
                const scrollStep = (endPos - startPos) / stackItems.length;
                
                // Calculate target: jump to the next card's position
                let target;
                if (i === stackItems.length - 1) {
                  target = endPos + 300; // Scroll past the section
                } else {
                  target = startPos + (i + 1) * scrollStep + 10; // +10 to ensure we cross the threshold
                }

                lenisRef.current.scrollTo(target, {
                  duration: 1.5,
                  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
              }}
              className="stack-card absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-500 rounded-[60px] shadow-2xl border border-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              style={{ 
                backgroundColor: mounted && (theme === "dark" || resolvedTheme === "dark") ? item.darkColor : item.color, 
                zIndex: i,
              }}
            >
              <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center px-12 transition-transform duration-500 group-hover:-translate-y-4">
                <h2 className="text-[clamp(1.5rem,5vw,3.5rem)] font-black m-0 leading-tight tracking-tighter uppercase text-brand-600 dark:text-brand-100">
                  {item.title}
                </h2>
                <p className="text-base md:text-lg mt-4 font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto uppercase tracking-wide">
                  {item.desc}
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  {(item as any).features ? (
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                      {(item as any).features.map((feature: string) => (
                        <div key={feature} className="px-4 py-2 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {feature}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="px-6 py-2 rounded-full border border-brand-600/20 text-brand-600 dark:text-brand-100 text-xs font-black uppercase tracking-widest">
                      Explore Feature
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom identifier */}
              <div className="absolute bottom-10 left-12 flex items-center gap-3">
                  <span className="text-4xl font-black text-brand-600/10 dark:text-white/10 group-hover:text-brand-600/30 transition-colors">0{item.id}</span>
                  <div className="h-[1px] w-16 bg-brand-600/20 dark:bg-white/20 group-hover:w-24 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOVER IMAGE REVEAL SECTION --- */}
      <section className="py-[10%] px-[8%] relative bg-background">
        <h2 className="text-[10px] font-black text-muted-foreground tracking-[0.3em] mb-12 uppercase">
          CAPABILITIES portal
        </h2>
        <div className="relative z-10">
          {hoverFeatures.map((item, index) => (
            <div 
              key={item.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="py-8 border-b border-border cursor-pointer group flex items-center justify-between"
            >
              <h3 className="text-[clamp(1.5rem,4vw,3rem)] font-black m-0 group-hover:translate-x-4 transition-transform duration-500 uppercase leading-none text-foreground">
                {item.title}
              </h3>
              <ArrowRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-500 -rotate-45 group-hover:rotate-0" />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/4 right-[10%] w-[35vw] h-[55vh] pointer-events-none z-50 overflow-hidden rounded-[40px] border-8 border-background shadow-2xl"
            >
              <img src={hoverFeatures[hoveredIndex].img} className="w-full h-full object-cover" alt="Capability" />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- MARQUEE --- */}
      <div className="py-16 bg-brand-600 dark:bg-slate-900 text-white overflow-hidden flex whitespace-nowrap">
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
      <section className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.85] tracking-tighter mb-16 uppercase max-w-5xl text-foreground">
            Ready to <br />
            <span className="text-muted-foreground">Scale Safely?</span>
        </h2>
        <Link href="/login?mode=register" className="group relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
            className="absolute inset-0 bg-primary/10 -m-1 blur-lg rounded-2xl group-hover:bg-brand-500/20 transition-all"
          />
          <div 
            className="relative flex items-center justify-center gap-3 px-12 py-6 bg-primary text-primary-foreground font-bold text-xl overflow-hidden transition-all duration-500 hover:gap-6"
            style={{ 
              fontFamily: 'var(--font-logo)',
              clipPath: "polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)"
            }}
          >
            {/* Glint Effect */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
            
            <span className="relative z-10 tracking-tight uppercase">Launch Assistant</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            
            {/* Background Animation */}
            <div className="absolute inset-0 bg-brand-600 dark:bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
        </Link>
        <p className="mt-8 text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Start free • No credit card required • GDPR Compliant
        </p>
      </section>
    </div>
  );
}

