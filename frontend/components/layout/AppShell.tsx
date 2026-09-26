"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";
  const isLandingPage = pathname === "/landing";
  const isPublicPage = isLoginPage || isLandingPage;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (!isPublicPage) {
          // If first-time visit directly to root, open /landing
          if (pathname === "/") {
            router.replace("/landing");
          } else {
            // If accessing protected routes without session, route to /login
            router.replace("/login");
          }
        }
      } else if (isAuthenticated && isLoginPage) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, isLoginPage, pathname, router]);

  // Loading state during auth initialization (minimal spinner for dashboard/internal routes)
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030712] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-sky-400 tracking-wider uppercase font-mono">
            NusaQC - Initializing Terminal...
          </p>
        </div>
      </div>
    );
  }

  // Standalone Login page view
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#030712] text-slate-100">{children}</div>;
  }

  // Standalone Landing page view (full-screen immersive, no dashboard chrome)
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#030712] text-slate-100 overflow-x-hidden selection:bg-[#007BC0] selection:text-white">
        {children}
      </div>
    );
  }

  // Not authenticated redirecting...
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated full dashboard shell with unified Inter typography & fixed viewport sidebar
  return (
    <div className="min-h-screen bg-slate-100 antialiased font-sans">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen min-w-0">
        <Topbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
