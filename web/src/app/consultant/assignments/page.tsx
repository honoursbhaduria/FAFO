import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AssignmentsManager from "@/components/consultant/AssignmentsManager";

export default async function ConsultantAssignmentsPage() {
  const auth = await getAuthUser();
  if (!auth?.userId) redirect("/login");
  if (auth.role !== "CONSULTANT") redirect("/dashboard");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <h1 className="text-3xl font-black text-slate-900">Client Requests</h1>
          <p className="text-slate-500 font-medium mt-2">Review and manage all requests sent to you.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <AssignmentsManager />
        </div>
      </div>
    </DashboardLayout>
  );
}
