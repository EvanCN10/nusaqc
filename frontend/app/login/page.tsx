"use client";

import React from "react";
import Link from "next/link";
import { AuthPortalCard } from "@/components/auth/AuthPortalCard";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-[#007BC0]/30 selection:text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle ambient glow matching landing page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#013880]/25 via-[#007BC0]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-[#243E80]/15 blur-[100px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
        >
          <ArrowLeft className="size-3.5 text-[#75BEDE]" />
          <span>Back to Showcase</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src="/apple-touch-icon.png" alt="NusaQC" className="size-6 object-contain rounded-md" />
          <span className="text-xs font-semibold text-white tracking-tight">NusaQC</span>
        </div>
      </header>

      {/* Main Clean Card */}
      <main className="relative z-10 my-auto py-8">
        <AuthPortalCard />
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center text-xs text-slate-500 font-mono">
        4 IT 1 ELEKTRO - Compfest 18
      </footer>
    </div>
  );
}
