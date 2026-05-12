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
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Schemes</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Manage the government schemes you&apos;ve shortlisted for your business.
            </p>
          </div>
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-16 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100">
              <Bookmark size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No bookmarks found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">
              Explore the discovery section to find and save schemes that match your business profile.
            </p>
            <Link 
              href="/schemes"
              className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Start Discovery
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSchemes.map((scheme) => (
              <div 
                key={scheme.schemeId}
                className="bg-white p-7 rounded-[32px] border border-slate-100 transition-all duration-300 group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-500">
                    <Bookmark size={20} fill="currentColor" />
                  </div>
                  <button 
                    onClick={() => removeScheme(scheme.schemeId)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <h3 className="text-base font-black text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                  {scheme.schemeName}
                </h3>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  Saved: {new Date(scheme.savedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>

                <div className="mt-auto flex gap-2">
                  <Link 
                    href={`/schemes/${scheme.schemeId}`}
                    className="flex-1 text-center py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    Details
                  </Link>
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all">
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
