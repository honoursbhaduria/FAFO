"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  ArrowRight,
  Download,
  Info,
  Loader2,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
}

export default function CompliancePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState("Tax");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/compliance");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/compliance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          dueDate: newDate,
          type: newType,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewDate("");
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Remove this task?")) return;
    try {
      const res = await fetch(`/api/compliance?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => filter === "ALL" || t.status === filter);
  
  const stats = {
    overdue: tasks.filter(t => t.status === 'OVERDUE').length,
    dueSoon: tasks.filter(t => t.status === 'PENDING').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-600">Compliance Calendar</h1>
            <p className="text-slate-500 mt-1">Track your regulatory deadlines and avoid penalties.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={16} />
              Export Schedule
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-xl shadow-brand-100/50"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-3xl font-black text-red-600">{stats.overdue}</span>
              <div className="p-3 bg-red-50 rounded-2xl">
                <AlertCircle size={24} className="text-red-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Actions</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-3xl font-black text-amber-600">{stats.dueSoon}</span>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <Clock size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-3xl font-black text-emerald-600">{stats.completed}</span>
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-xs font-black tracking-widest transition-all uppercase ${
                    filter === f 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="pl-11 pr-6 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-600 appearance-none">
                <option>All Types</option>
                <option>Tax</option>
                <option>Registration</option>
                <option>Labour</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
                <p className="font-bold text-brand-600 uppercase tracking-widest text-xs">Syncing Calendar...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="p-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex gap-6">
                    <div className={`mt-1 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                      task.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                      task.status === 'OVERDUE' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-brand-50 border-brand-100 text-brand-600'
                    }`}>
                      <CalendarIcon size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-brand-600 flex items-center gap-3">
                        {task.title}
                        {task.status === 'OVERDUE' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest rounded-full">Expired</span>}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed max-w-xl">{task.description}</p>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={14} className="text-brand-600" />
                          Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {task.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    {task.status !== 'COMPLETED' ? (
                      <button 
                        onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-sm flex items-center gap-2 group/btn active:scale-95"
                      >
                        Mark Complete
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon size={40} />
                </div>
                <h3 className="text-xl font-black text-brand-600 mb-2">No tasks found</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-medium">Relax! You have no pending compliance actions for this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-600/90 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-brand-600 uppercase tracking-tighter">Add Custom Task</h2>
                  <p className="text-sm text-slate-500 font-medium">Create a personalized reminder for your business.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., GST Monthly Return"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-600 outline-none transition-all font-bold text-brand-600 placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details about this deadline..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-600 outline-none transition-all font-bold text-brand-600 placeholder:text-slate-300 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      required
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-600 outline-none transition-all font-bold text-brand-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-600 outline-none transition-all font-bold text-brand-600 appearance-none"
                    >
                      <option>Tax</option>
                      <option>Compliance</option>
                      <option>Registration</option>
                      <option>Labour</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-100 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : <><Plus size={24} /> Create Task</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
