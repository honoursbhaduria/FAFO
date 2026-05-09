"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bookmark, Trash2, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface SavedScheme {
  id: string;
  schemeId: string;
  schemeName: string;
  savedAt: string;
}

export default function SavedSchemesPage() {
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSchemes = async () => {
    try {
      const res = await fetch("/api/schemes/save");
      const data = await res.json();
      setSavedSchemes(data.saved || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const removeScheme = async (schemeId: string) => {
    try {
      await fetch(`/api/schemes/save?schemeId=${schemeId}`, { method: "DELETE" });
      setSavedSchemes(savedSchemes.filter(s => s.schemeId !== schemeId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-brand-600 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
              <Bookmark className="text-brand-600" size={24} />
            </div>
            Saved Schemes
          </h1>
          <p className="text-slate-500 mt-1">
            Manage the government schemes you&apos;ve shortlisted for your business.
          </p>
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Bookmark size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No saved schemes yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
              Explore the discovery section to find and save schemes that match your business profile.
            </p>
            <Link 
              href="/schemes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-600 shadow-xl shadow-brand-600/10 transition-all active:scale-95"
            >
              Start Discovering
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedSchemes.map((scheme) => (
              <div 
                key={scheme.schemeId}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Bookmark size={20} />
                  </div>
                  <button 
                    onClick={() => removeScheme(scheme.schemeId)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-brand-600 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
                  {scheme.schemeName}
                </h3>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  Saved on {new Date(scheme.savedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>

                <div className="flex gap-3">
                  <Link 
                    href={`/schemes/${scheme.schemeId}`}
                    className="flex-1 text-center py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    View Details
                  </Link>
                  <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all shadow-sm">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
