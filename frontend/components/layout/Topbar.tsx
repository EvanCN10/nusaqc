"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { WifiHigh, Bell, User } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (!pathname || pathname === "/") return "Dashboard";
  if (pathname.startsWith("/inspection")) return "Inspection";
  if (pathname.startsWith("/history/")) return "Lot History Detail";
  if (pathname.startsWith("/history")) return "Lot History";
  if (pathname.startsWith("/storage")) return "Lot Storage";
  if (pathname.startsWith("/dispatch/")) return "Export Dispatch Detail";
  if (pathname.startsWith("/dispatch")) return "Export Dispatch";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}

export const Topbar = () => {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="w-full h-16 px-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] shrink-0">
      <div className="flex items-center">
        <h1 className="text-sky-700 text-xl font-bold font-sans tracking-tight">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full outline outline-1 outline-offset-[-1px] outline-green-600 flex items-center gap-2 bg-green-50/60">
          <WifiHigh className="size-4 text-green-600" />
          <span className="text-green-700 text-xs font-semibold font-sans">
            AI Camera: Online
          </span>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
        >
          <Bell className="size-4.5" />
        </button>
        <div className="size-8 bg-sky-100 rounded-full border border-sky-300 flex justify-center items-center overflow-hidden">
          <User className="size-4 text-sky-700" />
        </div>
      </div>
    </header>
  );
};


