"use client";

import Link from "next/link";
import { User, Menu, ChevronDown, Globe, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

const Logo = ({ isTransparent, fontVariant }: { isTransparent?: boolean; fontVariant?: string }) => (
  <span 
    className={`text-2xl font-black tracking-tighter transition-colors duration-500 ${
      isTransparent ? "text-white" : "text-brand-600 dark:text-white"
    }`}
    style={{ fontFamily: fontVariant || 'var(--font-logo)' }}
  >
    OneClickSathi
  </span>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  const isHome = pathname === "/";
  // The header is transparent only on Home page when NOT scrolled
  const isTransparent = isHome && !scrolled;
  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // Determine font variant based on pathname
  let fontVariant = 'var(--font-logo)'; // Recia (Default/Home)
  if (pathname === '/schemes') fontVariant = 'var(--font-logo-alt)'; // Telma
  if (pathname === '/news') fontVariant = 'var(--font-logo-modern)'; // Geist

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return <div className="h-24" />;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-6"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div 
          className={`flex items-center justify-between px-6 h-16 rounded-2xl transition-all duration-700 border ${
            (scrolled || !isHome)
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10" 
              : "bg-transparent border-transparent"
          }`}
        >
          <div className="flex items-center gap-10">
            <Link href="/" className="active:scale-95 transition-transform">
              <Logo isTransparent={isTransparent} fontVariant={fontVariant} />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: "Schemes", href: "/schemes" },
                { label: "Consultants", href: "/consultant" },
                { label: "Compliance", href: "/compliance" },
                { label: "Smart Feed", href: "/news" }
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                    isTransparent 
                      ? "text-white/90 hover:text-white" 
                      : "text-slate-900 dark:text-white/90 hover:text-brand-600 dark:hover:text-brand-400"
                  }`}
                >
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle light={isTransparent} />
            
            <Link 
              href="/login" 
              className={`hidden sm:block text-xs font-black uppercase tracking-wider transition-colors px-2 ${
                isTransparent 
                  ? "text-white hover:text-white" 
                  : "text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400"
              }`}
            >
              Sign In
            </Link>
            
            <Link 
              href="/login?mode=register" 
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
                isTransparent
                  ? "text-brand-700 bg-white hover:bg-white/90"
                  : isDark
                    ? "text-brand-700 bg-white hover:bg-slate-200"
                    : "text-white bg-brand-600 hover:bg-brand-700"
              }`}
            >
              Get Started
            </Link>

            <button 
              className={`lg:hidden p-2 transition-colors ${isTransparent ? "text-white" : "text-brand-600 dark:text-white"}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-6">
              <nav className="flex flex-col gap-6">
                <Link href="/dashboard" className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</Link>
                <Link href="/schemes" className="text-lg font-bold text-slate-900 dark:text-white">Discover Schemes</Link>
                <Link href="/consultant" className="text-lg font-bold text-slate-900 dark:text-white">Consultant Hub</Link>
                <Link href="/compliance" className="text-lg font-bold text-slate-900 dark:text-white">Compliance</Link>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <Link href="/login" className="text-lg font-bold text-slate-500 dark:text-slate-400 text-center">Sign In</Link>
                  <Link href="/login?mode=register" className={`py-4 font-bold rounded-2xl text-center ${
                    isDark ? "bg-white text-brand-700" : "bg-brand-600 text-white"
                  }`}>Get Started</Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

