import React from "react";

type StatusBadgeProps = {
  decision: "PASS" | "FAIL";
};

export const StatusBadge = ({ decision }: StatusBadgeProps) => {
  return (
    <div
      className={`px-3 py-1 rounded-full inline-flex justify-center items-center ${
        decision === "PASS" ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <span
        className={`text-xs font-bold font-sans ${
          decision === "PASS" ? "text-green-600" : "text-red-600"
        }`}
      >
        {decision === "PASS" ? "✓ PASS" : "✗ FAIL"}
      </span>
    </div>
  );
};
