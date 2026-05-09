import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { Building2, Mail, MapPin, Target, Users, Calendar, ShieldCheck } from "lucide-react";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="w-32 h-32 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 text-4xl font-black border-4 border-white shadow-xl">
            {profile?.businessName ? profile.businessName.substring(0, 2).toUpperCase() : "YB"}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black text-brand-600">{profile?.businessName || "Your Business Name"}</h1>
              {profile?.isStartup && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Startup India</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-sm">
              <div className="flex items-center gap-1.5">
                <Building2 size={16} className="text-brand-600" />
                {profile?.industry || "Industry Not Set"}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-600" />
                {profile?.state || "Location Not Set"}
              </div>
            </div>
          </div>
          <button className="px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-600 shadow-xl shadow-brand-100 transition-all active:scale-95">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-brand-600 mb-8 flex items-center gap-2">
                <ShieldCheck className="text-brand-600" size={24} />
                Verification & IDs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GSTIN</p>
                  <p className="font-bold text-slate-900">{profile?.gstin || "Not provided"}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Udyam Registration</p>
                  <p className="font-bold text-slate-900">{profile?.udyamReg || "Not provided"}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PAN Card</p>
                  <p className="font-bold text-slate-900">{profile?.pan || "Not provided"}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Type</p>
                  <p className="font-bold text-slate-900">{profile?.entityType || "Proprietorship"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-brand-600 mb-8 flex items-center gap-2">
                <Target className="text-brand-600" size={24} />
                Business Goals
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile?.goals && profile.goals.length > 0 ? (
                  profile.goals.map((goal: string) => (
                    <span key={goal} className="px-4 py-2 bg-brand-50 text-brand-600 text-xs font-bold rounded-xl border border-brand-100">
                      {goal}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No goals set yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-brand-600 mb-6">Operations</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employees</p>
                    <p className="font-bold text-slate-900">{profile?.employeeCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turnover</p>
                    <p className="font-bold text-slate-900">₹{profile?.annualTurnover || "0"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership</p>
                    <p className="font-bold text-slate-900">
                      {profile?.isWomenOwned ? "Women Owned" : "Standard"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
