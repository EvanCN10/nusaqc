"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace("/login");
      } else if (isAuthenticated && isLoginPage) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Loading state during auth initialization
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-sky-400 tracking-wider uppercase font-mono">
            NusaQC • Memeriksa Sesi...
          </p>
        </div>
      </div>
    );
  }

  // Standalone Login page view (no sidebar / topbar)
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-slate-950 text-slate-100">{children}</div>;
  }

  // Not authenticated redirecting...
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated full dashboard shell
  return (
    <div className="min-h-screen flex bg-slate-100 overflow-x-hidden antialiased font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-100">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-auto">{children}</main>
      </div>
    </div>
  );
}
