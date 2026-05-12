"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Lock, Loader2 } from "lucide-react";

interface AssignmentItem {
  id: string;
  status: string;
  note?: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AssignmentsManager() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAssignments = async () => {
    setIsLoading(true);
    const res = await fetch("/api/consultant-assignments");
    const data = await res.json();
    setAssignments(data.assignments || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const updateStatus = async (assignmentId: string, status: string) => {
    setActionId(assignmentId);
    setMessage(null);

    try {
      const res = await fetch("/api/consultant-assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");

      setAssignments((prev) =>
        prev.map((item) => (item.id === assignmentId ? { ...item, status } : item))
      );
      setMessage("Request updated successfully.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 font-bold">
        <Loader2 size={18} className="animate-spin" />
        Loading requests...
      </div>
    );
  }

  if (assignments.length === 0) {
    return <div className="py-16 text-center text-slate-400 font-medium">No requests yet.</div>;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-600">
          {message}
        </div>
      )}
      {assignments.map((item) => (
        <div
          key={item.id}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
        >
          <div>
            <p className="text-sm font-black text-slate-900">{item.user.name || "Client"}</p>
            <p className="text-xs text-slate-400 font-bold">{item.user.email}</p>
            {item.note && <p className="text-xs text-slate-500 mt-2">{item.note}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                statusStyles[item.status] || "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {item.status}
            </span>
            {item.status === "PENDING" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(item.id, "ACCEPTED")}
                  disabled={actionId === item.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-600/90 disabled:opacity-60"
                >
                  <CheckCircle2 size={14} /> Accept
                </button>
                <button
                  onClick={() => updateStatus(item.id, "REJECTED")}
                  disabled={actionId === item.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-600/90 disabled:opacity-60"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
            {item.status === "ACCEPTED" && (
              <button
                onClick={() => updateStatus(item.id, "CLOSED")}
                disabled={actionId === item.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 disabled:opacity-60"
              >
                <Lock size={14} /> Close
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
