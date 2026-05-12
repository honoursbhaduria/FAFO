import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { Building2, Mail, MapPin, Target, Users, Calendar } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditableBusinessVerification from "@/components/profile/EditableBusinessVerification";
import EditableProfileHeader from "@/components/profile/EditableProfileHeader";

export default async function ProfilePage() {
  const auth = await getAuthUser();
  if (!auth?.userId) redirect("/login");
  if (auth.role === "CONSULTANT") redirect("/consultant/profile");

  const userId = auth.userId;

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true, name: true, profileImage: true }
  });

  if (!user) redirect("/login");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <EditableProfileHeader 
          user={{
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
          }} 
          profile={profile} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Details */}
          <div className="lg:col-span-2 space-y-8">
            {profile ? (
              <EditableBusinessVerification profile={profile} />
            ) : user?.role !== "CONSULTANT" && (
              <div className="bg-white p-12 rounded-[40px] border border-slate-100 text-center space-y-6">
                <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mx-auto">
                  <Building2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-brand-600">Complete your business profile</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Unlock personalized scheme recommendations and AI-powered insights for your business.</p>
                <Link href="/questionnaire" className="inline-block px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-600 -100 transition-all">
                  Start Questionnaire
                </Link>
              </div>
            )}


            <div className="bg-white p-8 rounded-[32px] border border-slate-100">
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
            <div className="bg-white p-8 rounded-[32px] border border-slate-100">
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
