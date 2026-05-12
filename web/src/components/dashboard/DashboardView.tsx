"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  BellRing,
  Newspaper,
  ShieldCheck,
  X,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardViewProps {
  data: any;
}

export default function DashboardView({ data }: DashboardViewProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];
  const upcomingTasks = data?.upcomingTasks || [];
  const recommendedSchemes = data?.recommendedSchemes || [];
  
  const kpis = [
    { label: "Pending Tasks", value: stats.taskCount || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Eligible Schemes", value: stats.eligibleSchemes || 0, icon: FileText, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Stored Documents", value: stats.docCount || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Applications", value: stats.applicationCount || 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "DOCUMENT": return <ShieldCheck size={14} className="text-emerald-500" />;
      case "SCHEME": return <Bookmark size={14} className="text-brand-500" />;
      case "TASK": return <CheckCircle2 size={14} className="text-amber-500" />;
      case "NEWS": return <Newspaper size={14} className="text-indigo-500" />;
      default: return <Bell size={14} />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch(type) {
      case "DOCUMENT": return "New Document";
      case "SCHEME": return "Scheme Saved";
      case "TASK": return "Task Updated";
      case "NEWS": return "Article Bookmarked";
      default: return "Update";
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-base font-medium">
            Live overview of your business growth and compliance status.
          </p>
        </div>
        <div className="flex items-center gap-3 relative" ref={alertsRef}>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-bold text-sm transition-all active:scale-95 group ${showAlerts ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
            Recent Alerts
            <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900">
              {recentActivity.length}
            </span>
          </button>

          {/* Notifications Popover */}
          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-16 w-80 bg-white rounded-[32px] border border-slate-100 z-50 overflow-hidden border-b-4 border-slate-200"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Activity Stream</h3>
                  <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {recentActivity.map((activity: any, i: number) => (
                        <div key={i} className="p-5 hover:bg-slate-50 transition-colors group">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:scale-110 transition-transform">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                                {getActivityLabel(activity.type)}
                              </p>
                              <p className="text-xs font-bold text-slate-900 truncate mb-1">
                                {activity.title}
                              </p>
                              <p className="text-[9px] font-medium text-slate-400">
                                {new Date(activity.date).toLocaleString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200">
                        <Bell size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent updates</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50/80 text-center border-t border-slate-100">
                  <button className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] hover:underline">
                    View Audit Log
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-[32px] border border-slate-100 transition-all duration-500 group">
            <div className={`${kpi.bg} ${kpi.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-current/5 group-hover:scale-110 transition-transform duration-500`}>
              <kpi.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Calendar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Compliance Timeline</h2>
            <Link href="/compliance" className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] hover:text-brand-700 transition-colors">Full Calendar →</Link>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
            {upcomingTasks.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {upcomingTasks.map((task: any) => (
                  <div key={task.id} className="p-7 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className={`w-1.5 h-12 rounded-full ${task.type === 'GST' ? 'bg-brand-600' : 'bg-amber-500'}`} />
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">{task.title}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{task.type} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-slate-50 text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 rounded-2xl transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900">System Clear</h3>
                <p className="text-slate-500 mt-1">No pending compliance actions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Schemes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Smart Matches</h2>
            <Link href="/schemes" className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] hover:text-brand-700 transition-colors">Explore All</Link>
          </div>
          <div className="space-y-4">
            {recommendedSchemes.map((scheme: any) => (
              <div key={scheme.name} className="bg-white p-6 rounded-[32px] border border-slate-100 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-100">
                    {scheme.authority}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all">
                      <ArrowUpRight size={16} />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1.5 leading-tight group-hover:text-brand-600 transition-colors">{scheme.name}</h4>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">{scheme.benefit}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={12} />
                  Ends: {scheme.deadline}
                </div>
              </div>
            ))}
            <Link 
              href="/schemes" 
              className="block w-full py-6 text-center border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:border-brand-400 hover:text-brand-600 hover:bg-white transition-all duration-300"
            >
              + Discover More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
