"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BusinessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dynamic questionnaire
    router.replace("/questionnaire");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500 font-medium">Redirecting to questionnaire...</p>
    </div>
  );
}
