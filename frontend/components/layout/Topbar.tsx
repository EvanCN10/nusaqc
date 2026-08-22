"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { WifiHigh, Bell, User } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/inspection" || pathname.startsWith("/inspection/")) return "Fish Inspection";
  if (pathname === "/history") return "Lot History";
  if (pathname.startsWith("/history/")) return "Lot History Detail";
  if (pathname === "/storage" || pathname.startsWith("/storage/")) return "Lot Storage";
  if (pathname === "/dispatch") return "Export Dispatch";
  if (pathname.startsWith("/dispatch/")) return "Export Dispatch Detail";
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "Settings";
  return "NusaQC";
}

export const Topbar = () => {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="w-full h-16 px-6 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-b border-slate-300 flex justify-between items-center z-10">
      <div className="flex flex-col justify-start items-start">
        <h1 className="text-sky-700 text-2xl font-bold font-sans leading-8">
          {title}
        </h1>
      </div>
      <div className="flex justify-start items-center gap-4">
        <div className="px-3 py-1 rounded-full outline outline-1 outline-offset-[-1px] outline-green-600 flex justify-start items-center gap-2 bg-green-50/50">
          <WifiHigh className="size-4 text-green-600" />
          <div className="text-green-600 text-sm font-medium font-sans">
            AI Camera: Online
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 rounded-full hover:bg-slate-100 text-[#3E4850] transition-colors cursor-pointer"
        >
          <Bell className="size-5" />
        </button>
        <div className="size-8 bg-indigo-100 rounded-full outline outline-1 outline-offset-[-1px] outline-slate-300 flex justify-center items-center overflow-hidden">
          <User className="size-4 text-[#006591]" />
        </div>
      </div>
    </header>
  );
};

