import React from "react";
import Image from "next/image";
import { LayoutDashboard, ScanLine, History, Settings, LogOut } from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="w-60 h-screen bg-slate-900 flex flex-col shadow-lg">
      
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
        <a href="#" className="px-3 py-3 bg-slate-800 rounded-md inline-flex items-center gap-3">
          <LayoutDashboard className="size-4 text-sky-500" />
          <span className="text-sky-500 text-sm font-medium font-['Inter']">
            Dashboard
          </span>
        </a>
        
        <a href="#" className="px-3 py-3 rounded-md inline-flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
          <ScanLine className="size-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium font-['Inter']">
            Inspection
          </span>
        </a>

        <a href="#" className="px-3 py-3 rounded-md inline-flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
          <History className="size-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium font-['Inter']">
            Lot History
          </span>
        </a>

        <a href="#" className="px-3 py-3 rounded-md inline-flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
          <Settings className="size-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium font-['Inter']">
            Settings
          </span>
        </a>
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
