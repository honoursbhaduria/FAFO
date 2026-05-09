import Header from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  Share2,
  Bookmark
} from "lucide-react";
import Link from "next/link";

export default async function SchemeDetailsPage({ params }: { params: { id: string } }) {
  const scheme = await prisma.schemes.findUnique({
    where: { api_id: params.id }
  });

  if (!scheme) {
    notFound();
  }

  const data = (scheme.raw_data as any)?.fields || {};
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/schemes" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Discovery
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(scheme.categories as string[])?.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {cat}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                    {data.level || "Central"}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                  {scheme.scheme_name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 py-6 border-y border-slate-50">
                  <div className="flex items-start gap-3">
                    <Building2 className="text-slate-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ministry / Department</p>
                      <p className="text-slate-700 font-medium">{data.nodalMinistryName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-slate-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">State / Region</p>
                      <p className="text-slate-700 font-medium">{data.beneficiaryState?.join(", ") || "All India"}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {data.briefDescription || "No detailed description provided."}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  Eligibility Criteria
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Gender", value: data.gender || "All" },
                    { label: "Caste", value: data.caste || "All" },
                    { label: "Residence", value: data.residence || "Both Urban & Rural" },
                    { label: "Employment", value: data.employmentStatus || "N/A" }
                  ].map((item) => (
                    <li key={item.label} className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                      <span className="text-slate-700 font-semibold">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                <div className="space-y-4">
                  <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group transition-all">
                    Apply Now
                    <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Bookmark size={18} />
                      Save
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-amber-600 mb-4 font-bold text-sm">
                    <Calendar size={16} />
                    Application Timeline
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Most applications for this scheme are processed within 30-45 business days after submission of all documents.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-lg text-white">
                <h4 className="font-bold mb-2">AI Quick Insight</h4>
                <p className="text-sm text-blue-100 leading-relaxed mb-4">
                  "This scheme is highly recommended for startups in their first 2 years. Ensure your GST registration is active before applying."
                </p>
                <Link 
                  href="/ai" 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                >
                  Ask AI More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
