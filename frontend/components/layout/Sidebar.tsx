"use client";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inspection", label: "Inspection", icon: ScanLine },
    { href: "/history", label: "Lot History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="h-screen sticky top-0 bg-slate-900 flex flex-col shadow-lg overflow-y-auto overflow-x-hidden">
      <div className="p-4 border-b border-slate-300/20 flex items-center gap-3">
        <img className="w-10 h-11" src="/logo.svg" alt="NusaQC Logo" />
        <div className="flex flex-col">
          <span className="text-white text-xl font-bold font-['Inter'] leading-7">
            NusaQC
          </span>
          <span className="text-white/60 text-[10px] font-semibold font-['Inter'] uppercase tracking-wider">
            Fish Processing AI
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 mt-4 flex-1 px-2">
        {navItems.map(({href, label, icon: Icon}) => (
          <Link key={href} href={href} className={`px-3 py-3 rounded-md inline-flex items-center gap-3 transition-colors ${isActive(href)
            ? "bg-slate-800 border-l-sky-500"
            : "border-l-transparent hover:bg-slate-800/50"
          }`}>
            <Icon className={`size-4 ${isActive(href) ? "text-sky-500" : "text-slate-400"}`}/>
            <span className={`text-sm font-medium font-['Inter'] ${isActive(href) ? "text-sky-500" : "text-slate-400"}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-sky-500 rounded-full flex justify-center items-center">
            <span className="text-white text-xs font-bold font-['Inter']">
              QC
            </span>
          </div>
          <span className="text-white text-sm font-medium font-['Inter']">
            QC Supervisor
          </span>
        </div>
        <LogOut className="size-4 text-slate-400 cursor-pointer hover:text-white transition-colors" />
      </div>
    </aside>
  );
};
