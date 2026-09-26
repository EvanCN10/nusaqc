"use client";

import React from "react";

interface FullscreenVideoLoaderProps {
  className?: string;
  onEnded?: () => void;
}

export function FullscreenVideoLoader({ className = "", onEnded }: FullscreenVideoLoaderProps) {
  return (
    <div
      id="fullscreen-video-loader"
      role="status"
      aria-label="Loading NusaQC"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FBFBFB] w-screen h-screen overflow-hidden select-none ${className}`}
    >
      <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center p-4">
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onEnded}
          className="w-full h-full object-contain pointer-events-none"
        >
          <source src="/videos/LOADING_PAGE_NUSA_QC.mp4" type="video/mp4" />
          <p className="sr-only">Loading NusaQC...</p>
        </video>
      </div>
    </div>
  );
}
