import React from "react";

type HardwareBadgeProps = {
  status: "Online" | "Offline" | "Active" | "Inactive";
};

const statusConfig = {
  Online:   { bg: "bg-green-100", dot: "bg-green-600", text: "text-green-600" },
  Active:   { bg: "bg-green-100", dot: "bg-green-600", text: "text-green-600" },
  Offline:  { bg: "bg-red-100",   dot: "bg-red-500",   text: "text-red-600"   },
  Inactive: { bg: "bg-red-100",   dot: "bg-red-500",   text: "text-red-600"   },
};

export const HardwareBadge = ({ status }: HardwareBadgeProps) => {
  const { bg, dot, text } = statusConfig[status];
  return (
    <div className={`px-3 py-1 rounded-full inline-flex items-center gap-1 ${bg}`}>
      <div className={`size-1.5 rounded-full ${dot}`} />
      <span className={`text-xs font-bold font-sans ${text}`}>{status}</span>
    </div>
  );
};
