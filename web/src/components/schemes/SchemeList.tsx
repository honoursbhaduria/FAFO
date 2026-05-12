"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ArrowRight, ExternalLink, ChevronLeft, ChevronRight, Star, Tag, MapPin, Calendar, ChevronDown } from "lucide-react";
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
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pagination, setPagination] = useState<any>(null);

  const fetchSchemes = async (pageNum = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);
    params.append("page", pageNum.toString());
    
    try {
      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();
      setSchemes(data.items || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1");
    setPage(p);
    fetchSchemes(p);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (query) params.set("q", query); else params.delete("q");
    params.set("page", "1");
    window.history.pushState(null, "", `?${params.toString()}`);
    setPage(1);
    fetchSchemes(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    window.history.pushState(null, "", `?${params.toString()}`);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Unified Search & Filter Bar */}
      <div className="bg-white p-2 rounded-[32px] border border-slate-100 flex flex-col lg:flex-row items-stretch gap-2">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
          <form onSubmit={handleSearch} className="h-full">
            <input
              type="text"
              placeholder="Search schemes, benefits, or ministries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-transparent text-slate-900 font-medium placeholder:text-slate-300 outline-none transition-all h-full"
            />
          </form>
        </div>

        {/* Category Filter */}
        <div className="relative lg:w-64">
          <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <select 
            value={category}
            onChange={(e) => {
              const newCat = e.target.value;
              setCategory(newCat);
              const params = new URLSearchParams(window.location.search);
              if (newCat) params.set("category", newCat); else params.delete("category");
              params.set("page", "1");
              window.history.pushState(null, "", `?${params.toString()}`);
              setPage(1);
              fetchSchemes(1);
            }}
            className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-50 rounded-[24px] text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 appearance-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {[
              "Business & Entrepreneurship",
              "Education & Learning",
              "Social welfare & Empowerment",
              "Agriculture,Rural & Environment",
              "Health & Wellness"
            ].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>

        {/* Region Filter */}
        <div className="relative lg:w-48">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <select className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-50 rounded-[24px] text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 appearance-none transition-all cursor-pointer">
            <option>All India</option>
            <option>Uttar Pradesh</option>
            <option>Maharashtra</option>
            <option>Gujarat</option>
            <option>Karnataka</option>
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>

        <button 
          onClick={(e: any) => handleSearch(e)}
          className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          Discovery
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-white border border-slate-50 rounded-[32px] animate-pulse" />
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
                    className="group bg-white rounded-[32px] border border-slate-100 hover:border-brand-300 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Card Header with Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={categoryName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-slate-900 border border-white">
                          {scheme.raw_data?.fields?.level || "Central"}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent">
                        <p className="text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">
                          {categoryName}
                        </p>
                        <h3 className="text-white text-base font-black leading-tight line-clamp-1">
                          {scheme.scheme_name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-6 font-medium">
                        {scheme.raw_data?.fields?.briefDescription || "Access comprehensive government support and financial incentives tailored for your business segment."}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="truncate max-w-[140px] uppercase tracking-wider">{scheme.raw_data?.fields?.nodalMinistryName || "Ministry of MSME"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(scheme.fetched_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link 
                            href={`/schemes/${scheme.api_id}`}
                            className="flex-1 bg-slate-900 text-white text-center py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
                          >
                            Check Details
                          </Link>
                          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all">
                            <ExternalLink size={16} />
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
              className="text-center py-32 bg-white rounded-[40px] border border-slate-100"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No matches found</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Try broadening your search or adjusting filters to discover more opportunities.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-12">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button 
                    key={p} 
                    onClick={() => handlePageChange(p)}
                    className={`w-11 h-11 rounded-2xl font-black text-xs transition-all ${
                      p === page 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

