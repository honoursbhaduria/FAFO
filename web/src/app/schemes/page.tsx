import DashboardLayout from "@/components/layout/DashboardLayout";
import SchemeList from "@/components/schemes/SchemeList";
import { Suspense } from "react";

export default function SchemesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Discover Schemes</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Browse through thousands of government schemes tailored for your business.
            </p>
          </div>
        </div>
        
        <Suspense fallback={<div className="flex justify-center py-20">Loading schemes...</div>}>
          <SchemeList />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
