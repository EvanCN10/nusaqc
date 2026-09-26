"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Cpu, GitCompare, Boxes } from "lucide-react";

export function LandingHowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      num: "01",
      icon: Camera,
      title: "Optical Capture Ingestion",
      desc: "Industrial USB camera with LED ring illumination and polarizing filter captures clean, glare-free frames of each fish specimen.",
      badge: "Polarized Ingestion",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Sequential Edge Inference",
      desc: "MobileNetV3 classifies eye and gill freshness into Grade A, B, or C, while YOLOv8s detects surface defects in under 1.5 seconds.",
      badge: "MobileNetV3 + YOLOv8s",
    },
    {
      num: "03",
      icon: GitCompare,
      title: "Deterministic Rule Decision",
      desc: "Local logic synthesizes freshness and defect counts into clear operational outcomes: PASS (Green), CONDITIONAL (Yellow), or FAIL (Red).",
      badge: "PASS / COND / FAIL",
    },
    {
      num: "04",
      icon: Boxes,
      title: "Smart Storage & Dispatch",
      desc: "Approved lots are placed into Cold or Frozen bays with auto-assign logic, generating export PDF certificates with tracking QR codes.",
      badge: "QR Tracking & PDF",
    },
  ];

  return (
    <section id="pipeline" className="relative py-28 md:py-36 bg-[#030712] overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-widest text-[#FFBD07] block mb-3"
          >
            Inspection Workflow
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]"
          >
            From Conveyor Capture to Cold Chain Dispatch.
          </motion.h2>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 + idx * 0.1 }}
                className="relative liquid-glass rounded-3xl p-7 border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-[#007BC0]/80">
                      {step.num}
                    </span>
                    <div className="size-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      <Icon className="size-5 text-sky-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-300 font-light leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08]">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-slate-300 border border-white/10">
                    {step.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
