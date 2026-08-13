"use client";
import React from "react";
import { motion } from "framer-motion";

type TowerLightProps = {
  signal: "GREEN" | "YELLOW" | "RED";
};

const signalConfig = {
  GREEN: {
    label: "GREEN",
    dot: "bg-green-500",
    glow: "shadow-[0px_0px_8px_0px_rgba(34,197,94,0.60)]",
    text: "text-green-600",
  },
  YELLOW: {
    label: "YELLOW",
    dot: "bg-yellow-400",
    glow: "shadow-[0px_0px_8px_0px_rgba(234,179,8,0.60)]",
    text: "text-yellow-600",
  },
  RED: {
    label: "RED",
    dot: "bg-red-500",
    glow: "shadow-[0px_0px_8px_0px_rgba(239,68,68,0.60)]",
    text: "text-red-600",
  },
};

export const TowerLight = ({ signal }: TowerLightProps) => {
  const { label, dot, glow, text } = signalConfig[signal];
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`size-6 rounded-full ${dot} ${glow}`}
        animate={{
          scale: [1, 1.15, 0.85, 1.15, 1],
          opacity: [1, 0.85, 1, 0.85, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
