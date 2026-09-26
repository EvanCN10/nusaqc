"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  History,
  Boxes,
  Truck,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth, Role } from "@/lib/auth";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, canAccess } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inspection", label: "Inspection", icon: ScanLine },
    { href: "/history", label: "Lot History", icon: History },
    { href: "/storage", label: "Lot Storage", icon: Boxes },
    { href: "/dispatch", label: "Export Dispatch", icon: Truck },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => canAccess(item.href));

  const getRoleBadgeStyle = (role?: Role) => {
    switch (role) {
      case "admin":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
          avatarBg: "bg-emerald-600",
          label: "System Admin",
        };
      case "supervisor":
        return {
          bg: "bg-sky-500/15 border-sky-500/40 text-sky-300",
          avatarBg: "bg-sky-600",
          label: "QC Supervisor",
        };
      case "operator":
      default:
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          avatarBg: "bg-amber-600",
          label: "QC Operator",
        };
    }
  };

  const roleStyle = getRoleBadgeStyle(user?.role);

  return (
    <aside className="h-screen sticky top-0 bg-slate-900 flex flex-col shadow-lg overflow-y-auto overflow-x-hidden w-64 shrink-0 border-r border-slate-800">
      <div className="h-16 px-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
        <img className="w-8 h-8 object-contain" src="/logo.svg" alt="NusaQC Logo" />
        <div className="flex flex-col">
          <span className="text-white text-lg font-bold font-sans leading-tight">
            NusaQC
          </span>
          <span className="text-sky-400 text-[10px] font-bold font-sans uppercase tracking-wider">
            Fish Processing AI
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 mt-4 flex-1 px-2">
        {visibleNavItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-3 rounded-md inline-flex items-center gap-3 transition-colors ${
              isActive(href)
                ? "bg-slate-800 text-sky-400 font-semibold border-l-4 border-sky-500"
                : "text-slate-400 font-medium hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <Icon className={`size-4 ${isActive(href) ? "text-sky-400" : "text-slate-400"}`} />
            <span className="text-sm font-sans">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Dynamic User Session & RBAC Badge */}
      <div className="p-3.5 border-t border-white/10 flex items-center justify-between mt-auto bg-slate-950/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`size-8 ${roleStyle.avatarBg} rounded-full flex justify-center items-center shrink-0 shadow-sm`}
          >
            <span className="text-white text-xs font-bold font-sans">
              {user?.avatarText || "QC"}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white text-xs font-semibold font-sans truncate">
              {user?.name || "Petugas NusaQC"}
            </span>
            <div className="mt-0.5">
              <span
                className={`inline-block px-1.5 py-0.2 border rounded text-[9px] font-bold uppercase tracking-wider ${roleStyle.bg}`}
              >
                {roleStyle.label}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Keluar dari Sesi (Logout)"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
};
