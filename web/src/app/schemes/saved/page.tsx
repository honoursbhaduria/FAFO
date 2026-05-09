"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bookmark, Trash2, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SavedScheme {
  apiId: string;
  schemeName: string;
  savedAt: string;
}

export default function SavedSchemesPage() {
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_schemes") || "[]");
    setSavedSchemes(saved);
  }, []);

  const removeScheme = (apiId: string) => {
    const updated = savedSchemes.filter(s => s.apiId !== apiId);
    localStorage.setItem("saved_schemes", JSON.stringify(updated));
    setSavedSchemes(updated);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bookmark className="text-blue-600" size={24} />
            </div>
            Saved Schemes
          </h1>
          <p className="text-slate-500 mt-1">
            Manage the government schemes you&apos;ve shortlisted for your business.
          </p>
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Bookmark size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No saved schemes yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Explore the discovery section to find and save schemes that match your business profile.
            </p>
            <Link 
              href="/schemes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Start Discovering
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedSchemes.map((scheme) => (
              <div 
                key={scheme.apiId}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Bookmark size={20} />
                  </div>
                  <button 
                    onClick={() => removeScheme(scheme.apiId)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {scheme.schemeName}
                </h3>
                
                <p className="text-xs text-slate-400 font-medium mb-6">
                  Saved on {new Date(scheme.savedAt).toLocaleDateString(undefined, { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>

                <div className="flex gap-3">
                  <Link 
                    href={`/schemes/${scheme.apiId}`}
                    className="flex-1 text-center py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
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
