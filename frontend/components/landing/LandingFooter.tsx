"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function LandingFooter() {
  const { isAuthenticated } = useAuth();
  const dashboardHref = isAuthenticated ? "/" : "/login";

  return (
    <footer className="bg-[#02050b] border-t border-white/[0.08] py-14 px-6 text-slate-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <img src="/apple-touch-icon.png" alt="NusaQC Logo" className="size-6 object-contain rounded-md" />
            <span className="text-white font-bold text-base font-sans tracking-tight">NusaQC</span>
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">Edge Node Live</span>
          </div>
          <p className="text-slate-500 font-sans text-xs max-w-sm text-center md:text-left">
            Autonomous visual quality intelligence, edge computer vision, and cold storage
            management for seafood processing facilities.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-slate-300 font-sans text-sm">
          <Link href={dashboardHref} className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/inspection" className="hover:text-white transition-colors">
            Inspection
          </Link>
          <Link href="/storage" className="hover:text-white transition-colors">
            Cold Storage
          </Link>
          <Link href="/dispatch" className="hover:text-white transition-colors">
            Export Dispatch
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Login
          </Link>
        </div>

        {/* Copyright & Credit */}
        <div className="text-slate-500 text-center md:text-right font-sans">
          <div className="font-medium text-slate-300">4 IT 1 ELEKTRO - Compfest 18</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Autonomous Fish Quality & Cold Storage Intelligence.</div>
        </div>
      </div>
    </footer>
  );
}
