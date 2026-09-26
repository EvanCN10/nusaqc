"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ThermometerSnowflake, ShieldAlert, CheckCircle2, Lock, FileSpreadsheet } from "lucide-react";

export function LandingArchitecture() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="storage" className="relative py-28 md:py-36 bg-[#030712] overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-widest text-[#FFBD07] block mb-3"
          >
            Storage & Governance
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]"
          >
            2-Zone Cold Chain & Compliance.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Storage Zones */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="liquid-glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <ThermometerSnowflake className="size-6 text-sky-400" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400 block">
                    Storage Allocation
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Dual Temperature Zones
                  </h3>
                </div>
              </div>

              <p className="text-slate-300 text-base leading-relaxed mb-8 font-light">
                Facility storage is segmented into 2 distinct functional zones. The smart allocator
                optimizes placement for approved lots, while operators retain full manual reassignment controls.
              </p>

              {/* 2 Zones Card */}
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-white">Cold Zone (25 Slots A01 to E05)</div>
                      <div className="text-xs text-slate-400">Target Range: 0.0°C to 4.0°C (Fresh Handling)</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-sky-400">0°C to 4°C</div>
                    <div className="text-[10px] text-slate-400">Chilled Zone</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-white">Frozen Zone (10 Slots F-01 to F-10)</div>
                      <div className="text-xs text-slate-400">Target Range: &le; -18.0°C (Long-Term Deep Freeze)</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-cyan-300">&le; -18°C</div>
                    <div className="text-[10px] text-slate-400">Deep Freeze</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Total Capacity: 35 Slots</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="size-4" /> Smart Auto-Assign Active
              </span>
            </div>
          </motion.div>

          {/* Column 2: Governance & Traceability */}
          <motion.div
            id="compliance"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="liquid-glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-11 rounded-xl bg-[#FFBD07]/15 border border-[#FFBD07]/30 flex items-center justify-center">
                  <ShieldAlert className="size-6 text-[#FFBD07]" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FFBD07] block">
                    Governance & Export Records
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Role-Based Access & Audit
                  </h3>
                </div>
              </div>

              <p className="text-slate-300 text-base leading-relaxed mb-8 font-light">
                Enterprise security controls ensure separation of duties across Operators, QC
                Supervisors, and System Administrators, paired with complete CSV and PDF dispatch records.
              </p>

              {/* RBAC & Manifest */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <Lock className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Role-Based Access Control
                    </span>
                    <span className="text-xs text-slate-400">
                      Clear permissions for inspection logging, supervisor approvals, and system configuration.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <FileSpreadsheet className="size-4 text-[#FFBD07] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Export QC Certificates & Manifests
                    </span>
                    <span className="text-xs text-slate-400">
                      Official signed PDF certificates with container tracking QR codes and CSV logs.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Quality Standards</span>
              <span className="text-xs font-semibold text-sky-400 font-mono">FDA, BKIPM & SNI Aligned</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
