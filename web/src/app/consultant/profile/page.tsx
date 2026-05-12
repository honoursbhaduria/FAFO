import DashboardLayout from "@/components/layout/DashboardLayout";
import ConsultantProfileForm from "@/components/consultant/ConsultantProfileForm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ConsultantProfilePage() {
  const auth = await getAuthUser();
  if (!auth?.userId) redirect("/login");
  if (auth.role !== "CONSULTANT") redirect("/profile");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <h1 className="text-3xl font-black text-slate-900">CA Profile</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your professional details visible to users.</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100">
          <ConsultantProfileForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
