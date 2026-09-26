"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Target, ThermometerSnowflake, FileCheck } from "lucide-react";

export function LandingAbout() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const stats = [
    {
      icon: Zap,
      value: "&le; 1.5s",
      title: "Real-Time Inference",
      description: "Sequential MobileNetV3 freshness classification and YOLOv8s defect detection on edge CPU.",
      accent: "text-[#007BC0]",
      borderAccent: "group-hover:border-[#007BC0]/40",
    },
    {
      icon: Target,
      value: "mAP50 &ge; 0.70",
      title: "Defect Localization",
      description: "Identifies remaining scales, abnormal discoloration, tear wounds, foreign objects, and excessive slime.",
      accent: "text-[#FFBD07]",
      borderAccent: "group-hover:border-[#FFBD07]/40",
    },
    {
      icon: ThermometerSnowflake,
      value: "2-Zone",
      title: "Cold Chain Storage",
      description: "Smart allocation to Cold Zone (0°C to 4°C) or Frozen Zone (&le; -18°C) with manual operator override.",
      accent: "text-[#75BEDE]",
      borderAccent: "group-hover:border-[#75BEDE]/40",
    },
    {
      icon: FileCheck,
      value: "Audit Ready",
      title: "Export Certification",
      description: "Generates signed PDF QC certificates with embedded tracking QR codes and complete CSV audit logs.",
      accent: "text-emerald-400",
      borderAccent: "group-hover:border-emerald-400/40",
    },
  ];

  return (
    <section id="overview" className="relative py-28 md:py-36 bg-[#030712] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#007BC0]/10 blur-[140px] pointer-events-none rounded-full" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-widest text-[#FFBD07] block mb-3"
          >
            Platform Overview
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6"
          >
            Autonomous Intelligence.{" "}
            <span className="font-instrument italic text-slate-300 block">
              From Conveyor Line to Cold Storage.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg font-light leading-relaxed"
          >
            Seafood processing facilities handle high daily throughput where manual grading
            leads to fatigue, subjective bias, and potential export batch rejections. NusaQC
            combines edge computer vision on Raspberry Pi 5, deterministic local decision rules,
            and structured 2-zone cold storage management into a unified inspection terminal.
          </motion.p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + idx * 0.1 }}
                className={`group liquid-glass rounded-2xl p-7 border border-white/[0.08] ${stat.borderAccent} hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="size-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <Icon className={`size-5 ${stat.accent}`} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Metric 0{idx + 1}
                  </span>
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold ${stat.accent} font-mono tracking-tight mb-2`}
                  dangerouslySetInnerHTML={{ __html: stat.value }}
                />
                <h3 className="text-lg font-semibold text-white mb-2">{stat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
