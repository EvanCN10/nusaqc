import React from "react";

export const StatusBadge = () => {
  return (
    <div className="size- px-2.5 py-0.5 bg-green-100 rounded-full inline-flex justify-center items-center">
      <div className="text-center justify-center text-green-600 text-xs font-medium font-['Inter'] leading-4">
        ✓ PASS
      </div>
    </div>
  );
};
