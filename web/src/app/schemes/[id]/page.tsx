import Header from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Zap,
  FileText
} from "lucide-react";
import Link from "next/link";
import SchemeSidebar from "@/components/schemes/SchemeSidebar";

// Wikipedia fetching helpers
async function getWikipediaData(query: string) {
  try {
    const searchQuery = `${query} government scheme India`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const pageId = searchData.query?.search?.[0]?.pageid;

    if (!pageId) return null;

    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&exsentences=5&format=json&origin=*`;
    const extractRes = await fetch(extractUrl);
    const extractData = await extractRes.json();
    return extractData.query?.pages[String(pageId)]?.extract || null;
  } catch (err) {
    return null;
  }
}

export default async function SchemeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scheme = await prisma.schemes.findUnique({
    where: { api_id: id }
  });

  if (!scheme) {
    notFound();
  }

  const data = (scheme.raw_data as any)?.fields || {};
  const wikiExtract = await getWikipediaData(scheme.scheme_name || "");
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link 
            href="/schemes" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Discovery
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content - Bento Grid Layout */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
              
              {/* Large Card: Main Info */}
              <div className="md:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex flex-wrap gap-2 mb-6">
                  {(scheme.categories as string[])?.map((cat) => (
                    <span key={cat} className="px-4 py-1.5 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {cat}
                    </span>
                  ))}
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {data.level || "Central"}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-black text-brand-600 mb-8 leading-[1.1] tracking-tight">
                  {scheme.scheme_name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 py-8 border-y border-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Building2 className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ministry / Department</p>
                      <p className="text-brand-600 font-bold leading-tight">{data.nodalMinistryName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State / Region</p>
                      <p className="text-brand-600 font-bold leading-tight">{data.beneficiaryState?.join(", ") || "All India"}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-black text-brand-600 mb-4">Description</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {data.briefDescription || "No detailed description provided."}
                  </p>
                  {wikiExtract && (
                    <p className="text-slate-500 mt-4 leading-relaxed font-medium border-l-4 border-brand-100 pl-6 py-2 bg-brand-50/30 rounded-r-2xl">
                      {wikiExtract}
                    </p>
                  )}
                </div>
              </div>

              {/* Bento Card: Eligibility */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-brand-600 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  Eligibility
                </h3>
                
                {data.eligibility ? (
                  <p className="text-slate-500 text-sm font-medium leading-relaxed whitespace-pre-wrap">{data.eligibility}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Gender", value: data.gender || "All" },
                      { label: "Caste", value: data.caste || "All" },
                      { label: "Residence", value: data.residence || "Both" },
                      { label: "Status", value: data.employmentStatus || "N/A" }
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-slate-50 rounded-2xl">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                        <span className="text-slate-700 font-bold text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bento Card: Benefits */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-brand-600 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Zap className="text-amber-500" size={20} />
                  </div>
                  Benefits
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-6">
                  {data.benefits || "Financial assistance and subsidies tailored for business growth and operational support."}
                </p>
              </div>

              {/* Bento Card: Process (Wide) */}
              {data.application && (
                <div className="md:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black text-brand-600 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                      <FileText className="text-brand-500" size={20} />
                    </div>
                    Application Process
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <p className="text-slate-500 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {data.application}
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4">Required Documents</h4>
                      <div className="text-slate-500 text-sm font-medium leading-relaxed">
                        {data.documents || "Please keep your Aadhaar, PAN, and Business Registration certificates ready."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Client Component */}
            <div className="lg:col-span-4">
              <SchemeSidebar 
                schemeName={scheme.scheme_name || "Untitled Scheme"}
                externalUrl={data.url}
                apiId={scheme.api_id}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
