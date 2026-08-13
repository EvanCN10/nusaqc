import React from "react";
import { RecentInspections } from "./RecentInspections";
import { HardwareStatus } from "./HardwareStatus";

export const BodySection = () => {
  return (
    <div className="flex gap-4 min-h-[500px]">
      <RecentInspections />
      <HardwareStatus />
    </div>
  );
};
