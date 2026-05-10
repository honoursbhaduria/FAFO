import Header from "@/components/layout/Header";
import ModernLanding from "@/components/layout/ModernLanding";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ModernLanding />
      </main>
      
      <footer className="bg-white border-t py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    O
                </div>
                <span className="text-xl font-black text-brand-600">OneClickSathi</span>
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                © 2026 OneClickSathi • Empowering the next generation of business leaders.
            </p>
            <div className="flex gap-8 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <a href="#" className="hover:text-brand-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-brand-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-brand-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
