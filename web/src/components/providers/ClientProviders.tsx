"use client";

import { usePathname } from "next/navigation";
import SathiBot from "@/components/ui/SathiBot";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <>
      {children}
      {!isAuthPage && <SathiBot />}
    </>
  );
}
