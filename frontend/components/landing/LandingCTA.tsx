"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LandingCTA() {
  const { isAuthenticated } = useAuth();
  const dashboardHref = isAuthenticated ? "/" : "/login";

  return (
    <section className="relative py-20 md:py-28 bg-[#030712] overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Rectangle Card with Fade-In Animation from Bottom to Top on Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden"
        >
          {/* Background Pitch Deck Image with Boosted Opacity & Visibility */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/4 IT 1 ELEKTRO_NUSAQC_PITCHDECK_AIC.png"
              alt="NusaQC Overview"
              className="w-full h-full object-cover object-center brightness-105 contrast-105"
            />
            {/* Lighter Oceanic Gradient Overlay for Enhanced Pitchdeck Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/92 via-[#030712]/50 to-[#030712]/45" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Top Cyan Ambient Glow Highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_-16px_80px_0_rgba(0,123,192,0.3)_inset]" />

          {/* Content Container */}
          <div className="relative z-10 p-10 sm:p-16 md:p-20 text-center flex flex-col items-center">
            {/* Title */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-5 max-w-3xl leading-[1.15] drop-shadow-lg">
              Ready to Inspect Your Catch?
            </h2>

            {/* Description */}
            <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed drop-shadow">
              Deploy NusaQC edge intelligence on your processing line. Achieve objective freshness
              grading, defect localization, and seamless cold storage allocation.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href={dashboardHref}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#007BC0] to-[#013880] hover:from-[#007BC0]/90 hover:to-[#013880]/90 text-white font-semibold text-sm shadow-lg shadow-[#007BC0]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#75BEDE]/40"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white text-sm font-medium transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
