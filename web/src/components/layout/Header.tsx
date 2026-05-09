"use client";

import Link from "next/link";
import { Search, User, Menu, ChevronDown, Globe, Command } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative bg-slate-900 p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300">
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
    <span className="text-xl font-black tracking-tight text-slate-900">
      OneClick<span className="text-blue-600">Sathi</span>
    </span>
  </div>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-6"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div 
          className={`flex items-center justify-between px-6 h-16 rounded-2xl transition-all duration-500 border ${
            scrolled 
              ? "bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 border-white/50" 
              : "bg-transparent border-transparent"
          }`}
        >
          <div className="flex items-center gap-10">
            <Link href="/">
              <Logo />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Schemes", href: "/schemes" },
                { label: "Consultants", href: "/consultant" },
                { label: "Compliance", href: "/compliance" },
                { label: "Smart Feed", href: "/news" }
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                  <ChevronDown className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold">EN</span>
            </button>
            
            <Link 
              href="/login" 
              className="hidden sm:block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors px-2"
            >
              Sign In
            </Link>
            
            <Link 
              href="/login?mode=register" 
              className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200/50 transition-all active:scale-95 flex items-center gap-2"
            >
              Get Started
            </Link>

            <button 
              className="lg:hidden p-2 text-slate-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full px-6 mt-2"
          >
            <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50 flex flex-col gap-6">
              <nav className="flex flex-col gap-6">
                <Link href="/dashboard" className="text-lg font-bold text-slate-900">Dashboard</Link>
                <Link href="/schemes" className="text-lg font-bold text-slate-900">Discover Schemes</Link>
                <Link href="/consultant" className="text-lg font-bold text-slate-900">Consultant Hub</Link>
                <Link href="/compliance" className="text-lg font-bold text-slate-900">Compliance</Link>
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <Link href="/login" className="text-lg font-bold text-slate-500 text-center">Sign In</Link>
                  <Link href="/login?mode=register" className="py-4 bg-slate-900 text-white font-bold rounded-2xl text-center shadow-xl shadow-slate-900/20">Get Started</Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

