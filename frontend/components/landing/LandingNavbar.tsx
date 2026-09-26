"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const dashboardHref = isAuthenticated ? "/" : "/login";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-[padding,background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "py-3 bg-[#030712]/85 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/50"
          : "py-6 bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href="/landing" className="flex items-center gap-3 group">
          <img
            src="/apple-touch-icon.png"
            alt="NusaQC Logo"
            className="size-9 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white">
              NusaQC
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              Fish Quality Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
          <a href="#storage" className="hover:text-white transition-colors">Storage Zones</a>
          <a href="#compliance" className="hover:text-white transition-colors">Standards</a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
          >
            Login
          </Link>
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#007BC0] to-[#013880] hover:from-[#007BC0]/90 hover:to-[#013880]/90 text-white text-xs font-semibold shadow-lg shadow-[#007BC0]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#75BEDE]/30"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-300 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#030712]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-4">
          <a
            href="#overview"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-slate-200"
          >
            Overview
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-slate-200"
          >
            Capabilities
          </a>
          <a
            href="#pipeline"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-slate-200"
          >
            Pipeline
          </a>
          <a
            href="#storage"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-slate-200"
          >
            Storage Zones
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-slate-200"
          >
            Standards
          </a>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 text-sm font-medium text-slate-300"
            >
              Login
            </Link>
            <Link
              href={dashboardHref}
              onClick={() => setMobileOpen(false)}
              className="text-center py-3 rounded-xl bg-[#007BC0] text-white text-sm font-semibold"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
