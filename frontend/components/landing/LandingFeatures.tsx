"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ScanLine, Cpu, Boxes, FileCheck2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function LandingFeatures() {
  const { isAuthenticated } = useAuth();
  const dashboardHref = isAuthenticated ? "/" : "/login";
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    {
      icon: ScanLine,
      tag: "Edge Neural Pipeline",
      title: "Sequential Dual-Model Vision",
      description:
        "Executes two sequential ONNX models on CPU: MobileNetV3-Small for eye and gill freshness grading, followed by YOLOv8s for surface defect bounding box localization within 1,500 ms.",
      badge: "ONNX Runtime CPU",
      accent: "text-sky-400",
    },
    {
      icon: Cpu,
      tag: "Local Logic",
      title: "Deterministic Decision Engine",
      description:
        "Evaluates defect count, grade confidence, and organoleptic thresholds locally. Triggers instantaneous factory actions: PASS, CONDITIONAL, or FAIL, with physical tower light relay triggers.",
      badge: "100% On-Device",
      accent: "text-[#FFBD07]",
    },
    {
      icon: Boxes,
      tag: "Storage Management",
      title: "Smart 2-Zone Cold Allocation",
      description:
        "Smart auto-placement assigns Grade A lots to Cold Zone bays (0°C to 4°C) for rapid export access, and Grade B lots to standard cold or Frozen Zone (&le; -18°C) with manual operator override.",
      badge: "Cold & Frozen Bays",
      accent: "text-[#75BEDE]",
    },
    {
      icon: FileCheck2,
      tag: "Export Dispatch",
      title: "PDF Certificates & QR Tracking",
      description:
        "Generates official signed export QC certificates in PDF format with embedded container tracking QR codes, alongside instant CSV inspection logs for regulatory audits.",
      badge: "PDF & CSV Traceability",
      accent: "text-emerald-400",
    },
  ];

  return (
    <section id="capabilities" className="relative py-28 md:py-36 bg-[#030712] overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-xs font-mono uppercase tracking-widest text-[#FFBD07] block mb-3"
            >
              Engineered For Industrial Processing
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]"
            >
              Core System Capabilities.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#75BEDE] hover:text-white transition-colors group cursor-pointer"
            >
              <span>Explore live dashboard</span>
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 + idx * 0.1 }}
                className="group relative liquid-glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] hover:border-white/20 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-[#007BC0]/40 transition-colors">
                    <Icon className={`size-7 ${feat.accent}`} />
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/10">
                    {feat.badge}
                  </span>
                </div>

                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  {feat.tag}
                </span>

                <h3 className="text-2xl font-bold text-white tracking-tight mb-4">
                  {feat.title}
                </h3>

                <p className="text-slate-300 text-base leading-relaxed font-light">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
