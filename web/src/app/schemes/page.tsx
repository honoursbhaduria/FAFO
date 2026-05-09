import Header from "@/components/layout/Header";
import SchemeList from "@/components/schemes/SchemeList";
import { Suspense } from "react";

export default function SchemesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Schemes</h1>
            <p className="text-gray-600">Browse through thousands of government schemes and find the right one for you.</p>
          </div>
          
          <Suspense fallback={<div className="flex justify-center py-20">Loading schemes...</div>}>
            <SchemeList />
          </Suspense>
        </div>
      </main>
    </>
  );
}
