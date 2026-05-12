import Header from "@/components/layout/Header";
import ModernLanding from "@/components/layout/ModernLanding";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ModernLanding />
      </main>
      
      <footer className="bg-background border-t border-border py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
                <span 
                  className="text-xl font-black text-brand-600 dark:text-white"
                  style={{ fontFamily: 'var(--font-logo)' }}
                >
                  OneClickSathi
                </span>
            </div>
            <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest text-center md:text-left">
                © 2026 OneClickSathi • Empowering the next generation of business leaders.
            </p>
            <div className="flex gap-8 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                <Link href="/privacy" className="hover:text-brand-600 dark:hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Terms</Link>
                <Link href="/cookies" className="hover:text-brand-600 dark:hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
