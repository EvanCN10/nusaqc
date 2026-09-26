"use client";

import React, { useState, useEffect } from "react";
import { FullscreenVideoLoader } from "@/components/common/FullscreenVideoLoader";

export function LandingLoadingScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auto-dismiss after 3.8s (after logo animation and badge have appeared)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3800);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] transition-opacity duration-700 cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      title="Klik layar untuk melewati"
    >
      <FullscreenVideoLoader onEnded={handleSkip} />
      <div className="absolute bottom-6 right-6 z-[10000] text-xs font-mono text-slate-500/80 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-sm hover:bg-white hover:text-slate-800 transition">
        Klik layar untuk lewati &rarr;
      </div>
    </div>
  );
}
