import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function ConsultantDashboardPage() {
  const auth = await getAuthUser();
  if (!auth?.userId) redirect("/login");
  if (auth.role !== "CONSULTANT") redirect("/dashboard");

  // Safeguard check for the model
  const consultantAssignment = (prisma as any).consultantAssignment;
  
  if (!consultantAssignment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h1 className="text-2xl font-black text-slate-900">Database Schema Mismatch</h1>
          <p className="text-slate-500">The ConsultantAssignment model is not loaded in the Prisma Client. Please run <code className="bg-slate-100 px-2 py-1 rounded text-red-600">npx prisma generate</code> and restart the server.</p>
        </div>
      </DashboardLayout>
    );
  }

  const [user, assignments, pendingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    }),
    consultantAssignment.findMany({
      where: { consultantId: auth.userId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    consultantAssignment.count({
      where: { consultantId: auth.userId, status: "PENDING" },
    }),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <h1 className="text-3xl font-black text-slate-900">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="text-slate-500 font-medium mt-2">Here are your latest client requests and assignments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
              <Clock size={16} /> Pending Requests
            </div>
            <p className="text-3xl font-black text-slate-900 mt-4">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-100">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
              <FileText size={16} /> Total Requests
            </div>
            <p className="text-3xl font-black text-slate-900 mt-4">{assignments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-100">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
              <CheckCircle2 size={16} /> Status
            </div>
            <p className="text-sm font-bold text-slate-600 mt-4">Keep your profile updated to attract more clients.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">Latest Client Requests</h2>
          </div>
          {assignments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              No requests yet. Your new client requests will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((item: any) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.user.name || "Client"}</p>
                    <p className="text-xs text-slate-400 font-bold">{item.user.email}</p>
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">{item.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
