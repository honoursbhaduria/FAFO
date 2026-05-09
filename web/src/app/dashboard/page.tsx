import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Bell, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const kpis = [
    { label: "Upcoming Deadlines", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Eligible Schemes", value: "12", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Saved Docs", value: "8", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Apps", value: "2", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const upcomingTasks = [
    { title: "GST R1 Filing", date: "Oct 11, 2024", type: "Tax", priority: "High" },
    { title: "Udyam Renewal", date: "Oct 15, 2024", type: "Registration", priority: "Medium" },
    { title: "TDS Payment", date: "Oct 20, 2024", type: "Compliance", priority: "High" },
  ];

  const recommendedSchemes = [
    { 
      name: "MSME Idea Hackathon 3.0", 
      authority: "Ministry of MSME", 
      benefit: "Up to ₹15 Lakhs grant",
      deadline: "Oct 30, 2024"
    },
    { 
      name: "CLCSS for Technology Upgradation", 
      authority: "SIDBI", 
      benefit: "15% Capital Subsidy",
      deadline: "Ongoing"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, John! 👋</h1>
            <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your business compliance today.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Bell size={18} />
            Notifications
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span>
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`${kpi.bg} ${kpi.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <kpi.icon size={24} />
              </div>
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compliance Calendar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="text-blue-600" size={22} />
                Compliance Calendar
              </h2>
              <Link href="/compliance" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {upcomingTasks.map((task) => (
                  <div key={task.title} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                        <p className="text-sm text-slate-500">{task.type} • Due on {task.date}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-lg transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Schemes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recommended</h2>
              <Link href="/schemes" className="text-sm font-semibold text-blue-600 hover:underline">Explore</Link>
            </div>
            <div className="space-y-4">
              {recommendedSchemes.map((scheme) => (
                <div key={scheme.name} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {scheme.authority}
                    </span>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{scheme.name}</h4>
                  <p className="text-sm text-emerald-600 font-medium mb-3">{scheme.benefit}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    Deadline: {scheme.deadline}
                  </div>
                </div>
              ))}
              <Link 
                href="/schemes" 
                className="block w-full py-4 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-blue-400 hover:text-blue-600 transition-all"
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
