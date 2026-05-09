"use client";

import { ArrowRight, Play, Star, Shield, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50/50">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Trusted by 28,000+ MSMEs across India
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05]"
            >
              Fuel Your <br />
              <span className="text-blue-600">Business Dream</span> <br />
              with OneClick.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl"
            >
              The all-in-one growth platform for Indian entrepreneurs. Discover schemes, manage compliance, and consult with AI experts — all in one click.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-12"
            >
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group"
              >
                Access Your Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/schemes"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 text-slate-600 font-bold text-lg hover:text-slate-900 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                  <Play className="w-4 h-4 fill-current ml-1" />
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
                <span className="text-sm font-bold text-slate-600">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-slate-600">GST Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-slate-600">Free Discovery</span>
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
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80" 
                alt="Business workspace"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 z-20 max-w-[240px]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">AI Expert</p>
                  <p className="text-sm font-black text-slate-900">Analysis Ready</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                "We found 12 new MSME schemes for your textile business."
              </p>
            </motion.div>

            {/* Decorative Background for Image */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100 rounded-full -z-10 blur-3xl opacity-50" />
          </motion.div>
        </div>

        {/* Logo Cloud */}
        <div className="mt-32 pt-16 border-t border-slate-200/60">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">
            Government Partners & Initiatives
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-black text-slate-900">Ministry of MSME</span>
            <span className="text-xl font-black text-slate-900">Startup India</span>
            <span className="text-xl font-black text-slate-900">Digital India</span>
            <span className="text-xl font-black text-slate-900">Udyam</span>
            <span className="text-xl font-black text-slate-900">SIDBI</span>
          </div>
        </div>
      </div>
    </section>
  );
}

