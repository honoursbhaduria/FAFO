"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Bell, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const user = data?.user || {};
  
  const kpis = [
    { label: "Pending Tasks", value: stats.taskCount || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Eligible Schemes", value: stats.eligibleSchemes || 0, icon: FileText, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Stored Documents", value: stats.docCount || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Applications", value: stats.applicationCount || 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const upcomingTasks = data?.upcomingTasks || [];
  const recommendedSchemes = data?.recommendedSchemes || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-600">Welcome back, {user.name?.split(' ')[0] || "Entrepreneur"}! 👋</h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Here&apos;s a live overview of your business growth and compliance status.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Bell size={18} />
            Notifications
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full">
              {stats.taskCount || 0}
            </span>
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`${kpi.bg} ${kpi.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <kpi.icon size={24} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-brand-600 tracking-tight">{kpi.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compliance Calendar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-600 flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-xl">
                  <Calendar className="text-brand-600" size={20} />
                </div>
                Compliance Timeline
              </h2>
              <Link href="/compliance" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View Calendar</Link>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {upcomingTasks.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {upcomingTasks.map((task: any) => (
                    <div key={task.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className={`w-1.5 h-10 rounded-full ${task.type === 'GST' ? 'bg-brand-600' : 'bg-amber-500'}`} />
                        <div>
                          <h4 className="font-bold text-brand-600 group-hover:text-brand-600 transition-colors">{task.title}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{task.type} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="p-3 text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-bold text-slate-900">All caught up!</h3>
                  <p className="text-sm text-slate-500">No pending compliance tasks for now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Schemes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-600">Smart Picks</h2>
              <Link href="/schemes" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Discovery</Link>
            </div>
            <div className="space-y-4">
              {recommendedSchemes.map((scheme: any) => (
                <div key={scheme.name} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {scheme.authority}
                    </span>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </div>
                  <h4 className="font-bold text-brand-600 mb-1 leading-tight">{scheme.name}</h4>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">{scheme.benefit}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    Ends: {scheme.deadline}
                  </div>
                </div>
              ))}
              <Link 
                href="/schemes" 
                className="block w-full py-5 text-center border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold text-sm hover:border-brand-400 hover:text-brand-600 transition-all bg-slate-50/50"
              >
                + See more matches
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
