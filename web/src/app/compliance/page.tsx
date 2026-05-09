"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  ArrowRight,
  Download,
  Info
} from "lucide-react";
import { useState } from "react";

const tasks = [
  { id: 1, title: "GSTR-1 Filing", date: "2024-10-11", type: "Tax", status: "PENDING", priority: "High", description: "Monthly return for outward supplies." },
  { id: 2, title: "GSTR-3B Filing", date: "2024-10-20", type: "Tax", status: "PENDING", priority: "High", description: "Monthly self-declared summary return." },
  { id: 3, title: "Udyam Certificate Renewal", date: "2024-10-15", type: "Registration", status: "COMPLETED", priority: "Medium", description: "Annual validation of MSME registration." },
  { id: 4, title: "TDS Deposit (P10)", date: "2024-10-07", type: "Compliance", status: "OVERDUE", priority: "High", description: "Deposit of Tax Deducted at Source for the previous month." },
  { id: 5, title: "PF Contribution", date: "2024-10-15", type: "Labour", status: "PENDING", priority: "Medium", description: "Monthly Provident Fund contribution for employees." },
];

export default function CompliancePage() {
  const [filter, setFilter] = useState("ALL");

  const filteredTasks = tasks.filter(t => filter === "ALL" || t.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Compliance Calendar</h1>
            <p className="text-slate-500 mt-1">Track your regulatory deadlines and avoid penalties.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={16} />
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              + Add Custom Task
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Overdue</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-red-600">1</span>
              <AlertCircle size={20} className="text-red-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Due this month</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600">3</span>
              <Clock size={20} className="text-amber-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">1</span>
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setFilter("ALL")}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                All Tasks
              </button>
              <button 
                onClick={() => setFilter("PENDING")}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter("COMPLETED")}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Completed
              </button>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500">
                <option>All Types</option>
                <option>Tax</option>
                <option>Registration</option>
                <option>Labour</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                    task.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      {task.title}
                      {task.priority === 'High' && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded uppercase">Critical</span>}
                    </h4>
                    <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Due: {task.date}
                      </span>
                      <span>•</span>
                      <span>Type: {task.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Info size={18} />
                  </button>
                  {task.status !== 'COMPLETED' ? (
                    <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center gap-2">
                      Mark Complete
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tip Box */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
          <div className="relative z-10 max-w-xl">
            <h3 className="text-xl font-bold mb-2">Pro Tip: Automated Reminders</h3>
            <p className="text-blue-100 leading-relaxed mb-6">
              Connect your Google Calendar to sync these deadlines and receive real-time notifications on your mobile device.
            </p>
            <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
              Sync Calendar Now
            </button>
          </div>
          <Calendar size={180} className="absolute -right-12 -bottom-12 text-white/10 rotate-12" />
        </div>
      </div>
    </DashboardLayout>
  );
}
