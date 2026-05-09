"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ArrowRight, ExternalLink, ChevronLeft, ChevronRight, Star, Tag, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_IMAGES: Record<string, string> = {
  "Business & Entrepreneurship": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
  "Agriculture,Rural & Environment": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
  "Education & Learning": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80",
  "Social welfare & Empowerment": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80",
  "Health & Wellness": "https://images.unsplash.com/photo-1505751172107-573967a4f995?auto=format&fit=crop&w=400&q=80",
  "default": "https://images.unsplash.com/photo-1454165833767-0275510675b1?auto=format&fit=crop&w=400&q=80"
};

export default function SchemeList() {
  const searchParams = useSearchParams();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const fetchSchemes = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);
    
    try {
      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();
      setSchemes(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (query) params.set("q", query); else params.delete("q");
    window.history.pushState(null, "", `?${params.toString()}`);
    fetchSchemes();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-80 shrink-0">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm sticky top-32">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Refine Discovery
            </h3>
            {category && (
              <button 
                onClick={() => {
                  setCategory("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("category");
                  window.history.pushState(null, "", `?${params.toString()}`);
                  fetchSchemes();
                }}
                className="text-[10px] font-black text-blue-600 uppercase hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {[
              "Business & Entrepreneurship",
              "Education & Learning",
              "Social welfare & Empowerment",
              "Agriculture,Rural & Environment",
              "Health & Wellness"
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  const newCat = category === cat ? "" : cat;
                  setCategory(newCat);
                  const params = new URLSearchParams(window.location.search);
                  if (newCat) params.set("category", newCat); else params.delete("category");
                  window.history.pushState(null, "", `?${params.toString()}`);
                  fetchSchemes();
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                  category === cat 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate mr-2">{cat}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${category === cat ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
              </button>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Region</p>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 appearance-none">
                <option>All of India</option>
                <option>Uttar Pradesh</option>
                <option>Maharashtra</option>
                <option>Gujarat</option>
                <option>Karnataka</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by scheme name, ministry, or benefits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-lg font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
            />
          </form>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[420px] bg-white border border-slate-200/60 rounded-[32px] animate-pulse" />
              ))}
            </motion.div>
          ) : schemes.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {schemes.map((scheme, idx) => {
                const categoryName = scheme.categories?.[0] || "default";
                const imageUrl = CATEGORY_IMAGES[categoryName] || CATEGORY_IMAGES.default;
                
                return (
                  <motion.div 
                    key={scheme.api_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Card Header with Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={categoryName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                          {scheme.raw_data?.fields?.level || "Central"}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                          {categoryName}
                        </p>
                        <h3 className="text-white text-lg font-black leading-tight line-clamp-2">
                          {scheme.scheme_name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                        {scheme.raw_data?.fields?.briefDescription || "Access comprehensive government support and financial incentives tailored for your business segment."}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-50 pt-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="truncate max-w-[150px]">{scheme.raw_data?.fields?.nodalMinistryName || "Ministry of MSME"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(scheme.fetched_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link 
                            href={`/schemes/${scheme.api_id}`}
                            className="flex-1 bg-slate-900 text-white text-center py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-[0.98]"
                          >
                            Check Eligibility
                          </Link>
                          <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white rounded-[40px] border border-slate-200/60"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No matching schemes found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search query to find relevant results.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && schemes.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(p => (
                <button key={p} className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${p === 1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

