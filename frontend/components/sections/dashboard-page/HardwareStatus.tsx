"use client";

import React, { useState } from "react";
import { Server } from "lucide-react";
import { HardwareBadge } from "@/components/common/HardwareBadge";
import { TowerLight } from "@/components/common/TowerLight";
import { Switch } from "@/components/ui/Switch";

// TODO: Replace with API call - GET /api/v1/hardware/status
// TODO: Consider WebSocket for real-time updates - WS /ws/hardware
const MOCK_HARDWARE = {
  camera: "Online",
  conveyorRelay: "Active",
  towerLight: "GREEN",
  mockModeEnabled: true,
} as const;

export const HardwareStatus = () => {
  const [mockEnabled, setMockEnabled] = useState<boolean>(MOCK_HARDWARE.mockModeEnabled);

  return (
    <div className="w-72 self-stretch p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/30 flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="pb-2 border-b border-slate-300/30 flex justify-between items-center">
        <span className="text-base font-bold font-sans text-zinc-900">Hardware Status</span>
        <Server className="size-5 text-slate-300" />
      </div>

      {/* Status Rows */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-normal font-sans text-gray-700">Camera</span>
          <HardwareBadge status={MOCK_HARDWARE.camera} />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-normal font-sans text-gray-700">Conveyor Relay</span>
          <HardwareBadge status={MOCK_HARDWARE.conveyorRelay} />
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-base font-normal font-sans text-gray-700">Tower Light</span>
          <TowerLight signal={MOCK_HARDWARE.towerLight} />
        </div>
      </div>

      {/* Footer — Mock Toggle */}
      <div className="pt-4 border-t border-slate-300/30 flex justify-between items-center">
        <span className="text-xs font-normal font-mono text-gray-700">ENABLE_MOCK_HARDWARE</span>
        <Switch
          checked={mockEnabled}
          onCheckedChange={setMockEnabled}
          id="mock-hardware-toggle"
        />
      </div>
    </div>
  );
};
