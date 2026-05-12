import { ArrowRight, Play, Star, Shield, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D tilt
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-15, 15]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Content Left */}
          <div className="flex-1 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-600 dark:bg-brand-500 animate-pulse" />
              <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                Trusted by 28,000+ MSMEs across India
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-8 leading-[1.05]"
            >
              Fuel Your <br />
              <span className="text-brand-600 dark:text-brand-500">Business Dream</span> <br />
              with OneClick.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
            >
              The all-in-one growth platform for Indian entrepreneurs. Discover schemes, manage compliance, and consult with AI experts — all in one click.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-8 mb-12"
            >
              <Link 
                href="/dashboard" 
                className="group relative perspective-1000"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "circOut", delay: 0.5 }}
                    className="absolute inset-0 bg-primary/20 -m-2 blur-xl rounded-2xl group-hover:bg-brand-500/30 transition-all"
                  />
                  <div 
                    className="relative flex items-center justify-center gap-4 px-12 py-6 bg-primary text-primary-foreground font-bold text-xl overflow-hidden shadow-2xl transition-all duration-500 hover:gap-6"
                    style={{ 
                      fontFamily: 'var(--font-logo)',
                      clipPath: "polygon(0% 0%, 100% 0%, 92% 100%, 0% 100%)",
                      transform: "translateZ(20px)"
                    }}
                  >
                    {/* Spotlight Effect */}
                    <motion.div 
                      className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: useTransform(
                          [mouseX, mouseY],
                          ([x, y]) => `radial-gradient(circle at ${Number(x) + 120}px ${Number(y) + 40}px, rgba(255,255,255,0.15), transparent 80%)`
                        )
                      }}
                    />

                    {/* Glint Effect */}
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                    
                    <span className="relative z-10 tracking-tight" style={{ transform: "translateZ(30px)" }}>Access Dashboard</span>
                    <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" style={{ transform: "translateZ(30px)" }} />
                    
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-brand-600 dark:bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </div>
                </motion.div>
              </Link>

              <Link 
                href="/schemes"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 text-foreground font-black text-[11px] uppercase tracking-widest hover:text-brand-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-card transition-all group-hover:rotate-12">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                Browse Schemes
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-muted-foreground">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-muted-foreground">GST Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-muted-foreground">Free Discovery</span>
              </div>
            </motion.div>
          </div>

          {/* Image Right */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-card">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80" 
                alt="Business workspace"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-600/20 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl border border-border z-20 max-w-[240px] shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">AI Expert</p>
                  <p className="text-sm font-black text-foreground">Analysis Ready</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "We found 12 new MSME schemes for your textile business."
              </p>
            </motion.div>

            {/* Decorative Background for Image */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-100 dark:bg-brand-900 rounded-full -z-10 blur-3xl opacity-50" />
          </motion.div>
        </div>

        {/* Logo Cloud */}
        <div className="mt-32 pt-16 border-t border-border">
          <p className="text-center text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-10">
            Government Partners & Initiatives
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-black text-foreground">Ministry of MSME</span>
            <span className="text-xl font-black text-foreground">Startup India</span>
            <span className="text-xl font-black text-foreground">Digital India</span>
            <span className="text-xl font-black text-foreground">Udyam</span>
            <span className="text-xl font-black text-foreground">SIDBI</span>
          </div>
        </div>
      </div>
    </section>
  );
}


