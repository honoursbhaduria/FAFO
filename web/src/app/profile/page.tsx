import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { User, Building2, MapPin, BadgeCheck, FileText, Settings, CreditCard } from "lucide-react";

export default async function ProfilePage() {
  // Mock fetching the first profile for demo purposes
  const profile = await prisma.businessProfile.findFirst();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 bg-brand-100 rounded-3xl flex items-center justify-center text-brand-600 text-4xl font-bold border-4 border-blue-50 shadow-inner">
            {profile?.businessName?.[0] || "O"}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-brand-600">{profile?.businessName || "Your Business Name"}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                <BadgeCheck size={14} />
                Verified MSME
              </span>
            </div>
            <p className="text-slate-500 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
              <Building2 size={16} />
              {profile?.entityType || "Startup"} • {profile?.industry || "Uncategorized"}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                Edit Profile
              </button>
              <button className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                View Public Page
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-brand-600">Business Details</h2>
                <Settings size={20} className="text-slate-400" />
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: "GSTIN", value: profile?.gstin || "Not provided", icon: FileText },
                  { label: "Udyam Reg", value: profile?.udyamReg || "Not provided", icon: BadgeCheck },
                  { label: "Location", value: `${profile?.district || 'Delhi'}, ${profile?.state || 'India'}`, icon: MapPin },
                  { label: "Employee Count", value: profile?.employeeCount || "N/A", icon: User },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <item.icon size={12} />
                      {item.label}
                    </p>
                    <p className="text-slate-700 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <h2 className="text-xl font-bold text-brand-600">Categories & Ownership</h2>
              </div>
              <div className="p-8 flex flex-wrap gap-4">
                {[
                  { label: "Women Owned", active: profile?.isWomenOwned },
                  { label: "SC/ST Owned", active: profile?.isScStOwned },
                  { label: "Startup", active: profile?.isStartup },
                ].map((tag) => (
                  <div 
                    key={tag.label}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      tag.active 
                        ? "bg-brand-50 text-brand-600 border border-brand-100" 
                        : "bg-slate-50 text-slate-400 border border-slate-100 opacity-50"
                    }`}
                  >
                    {tag.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-brand-600 text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-brand-500" />
                Subscription
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                You are currently on the <span className="text-white font-bold">Growth Pro</span> plan.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Next Billing</span>
                  <span className="font-bold">Oct 24, 2024</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-brand-500" />
                </div>
              </div>
              <button className="w-full py-3 bg-white text-brand-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                Manage Billing
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-brand-600 mb-4">Security</h4>
              <button className="w-full text-left py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                Change Password
              </button>
              <button className="w-full text-left py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                Two-Factor Auth
              </button>
              <button className="w-full text-left py-2 text-sm font-semibold text-red-600 hover:underline mt-4">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
