import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardView from "@/components/dashboard/DashboardView";
import { getAuthUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const auth = await getAuthUser();

  if (!auth?.userId) {
    redirect("/login");
  }

  if (auth.role === "CONSULTANT") {
    redirect("/consultant/dashboard");
  }

  const data = await getDashboardData(auth.userId);

  return (
    <DashboardLayout>
      <DashboardView data={data} />
    </DashboardLayout>
  );
}
