"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LandingHero() {
  const { isAuthenticated } = useAuth();
  const dashboardHref = isAuthenticated ? "/" : "/login";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Parallax: video moves down noticeably with scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["-5%", "38%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.10]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#030712] pt-28 md:pt-36 pb-12"
    >
      {/* Background Parallax Video */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 w-full h-[150%] -top-[20%] pointer-events-none select-none z-0"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-75" : "opacity-0"
          }`}
        >
          <source src="/videos/LANDING_LOOP_PAGE.mp4" type="video/mp4" />
        </video>

        {/* Luminous, softened vignette allowing video details to shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/25 to-[#030712]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,7,18,0.55)_85%)]" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center my-auto flex flex-col items-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white tracking-tight leading-[1.08] mb-6"
        >
          Precision Fish Quality.{" "}
          <span className="font-instrument italic text-[#75BEDE] block sm:inline">
            Uncompromised at Scale.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-200 font-light leading-relaxed mb-10 text-balance drop-shadow-sm"
        >
          Edge computer vision visual inspection, local deterministic decision rules, and
          smart 2-zone cold storage management for industrial seafood processing facilities.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href={dashboardHref}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#007BC0] to-[#013880] text-white font-semibold text-base shadow-[0_0_35px_rgba(0,123,192,0.5)] hover:shadow-[0_0_50px_rgba(0,123,192,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Launch Platform Console</span>
            <ArrowRight className="size-5" />
          </Link>

          <a
            href="#capabilities"
            className="w-full sm:w-auto px-8 py-4 rounded-full liquid-glass text-slate-200 hover:text-white hover:bg-white/[0.08] font-medium text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Architecture</span>
            <ChevronDown className="size-4" />
          </a>
        </motion.div>
      </div>

      {/* Hero Bottom Telemetry Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="relative z-10 max-w-6xl mx-auto px-6 w-full pt-8"
      >
        <div className="liquid-glass rounded-2xl p-4 sm:p-5 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="pt-2 md:pt-0">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Edge Pipeline Latency
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              &le; 1,500 ms / fish
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Vision Neural Model
            </span>
            <span className="text-lg font-bold text-sky-400 font-mono">
              YOLOv8s + MobileNetV3
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Decision Engine
            </span>
            <span className="text-lg font-bold text-[#FFBD07] font-mono">
              Deterministic (Local)
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Cold Storage System
            </span>
            <span className="text-lg font-bold text-white font-mono">
              2-Zone Smart Allocation
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
