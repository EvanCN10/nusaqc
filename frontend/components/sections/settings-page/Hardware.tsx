"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, Check, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { testDeviceConnection } from "@/lib/api";

type HardwareProps = {
  mockMode: boolean;
  onMockModeChange: (val: boolean) => void;
  cameraSource: string;
  onCameraSourceChange: (val: string) => void;
  ipAddress: string;
  onIpAddressChange: (val: string) => void;
};

const CAMERA_OPTIONS = [
  { value: "mock", label: "Mock Camera (Simulated)" },
  { value: "usb0", label: "USB Industrial Camera (/dev/video0)" },
  { value: "rtsp", label: "IP RTSP Stream (rtsp://192.168.1.50/live)" },
];

export const Hardware = ({
  mockMode,
  onMockModeChange,
  cameraSource,
  onCameraSourceChange,
  ipAddress,
  onIpAddressChange,
}: HardwareProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const handleTest = async () => {
    if (!ipAddress) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testDeviceConnection(ipAddress);
      setTestResult({
        success: Boolean(res.success),
        message: res.message || (res.success ? "Berhasil terhubung" : "Gagal terhubung"),
        latency: res.latency_ms ?? res.latencyMs,
      });
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Gagal menghubungi backend API",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300/50 flex flex-col gap-6">
      {/* Section Header */}
      <div className="w-full pb-4 border-b border-slate-300/30 flex items-center gap-2">
        <Cpu className="size-5 text-sky-700" />
        <h2 className="text-xl font-semibold font-sans text-zinc-900">
          Hardware Configuration
        </h2>
      </div>

      {/* Mock Hardware Mode Banner */}
      <div className="w-full p-4 bg-amber-50 rounded-lg outline outline-1 outline-amber-500/30 flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold font-sans text-zinc-900">
            Mock Hardware Mode
          </span>
          <span className="text-sm font-normal font-sans text-gray-700">
            Run system without physical camera or GPIO connections.
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {mockMode && (
            <div className="px-2 py-1 bg-amber-500/20 rounded-sm outline outline-1 outline-amber-500/40">
              <span className="text-xs font-semibold font-sans tracking-wide text-amber-700">
                MOCK MODE ACTIVE
              </span>
            </div>
          )}

          {/* Custom Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={mockMode}
            onClick={() => onMockModeChange(!mockMode)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${
              mockMode ? "bg-sky-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`size-5 rounded-full bg-white shadow-md transform transition-transform flex items-center justify-center ${
                mockMode ? "translate-x-6 bg-blue-600" : "translate-x-0"
              }`}
            >
              {mockMode && <Check className="size-3 text-white stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Camera Source & GPIO Port Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Source Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold font-sans text-zinc-900">
            Camera Source
          </label>
          <div className="relative">
            <select
              value={cameraSource}
              onChange={(e) => onCameraSourceChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-md outline outline-1 outline-slate-300 appearance-none pr-9 text-base font-normal font-sans text-zinc-900 cursor-pointer focus:outline-sky-500"
            >
              {CAMERA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* GPIO Port Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold font-sans text-gray-700">
            GPIO Port
          </label>
          <div className="px-3 py-2.5 bg-gray-100 rounded-md outline outline-1 outline-slate-300/50">
            <span className="text-sm font-medium font-mono text-gray-700">
              /dev/gpiomem
            </span>
          </div>
          {mockMode && (
            <span className="text-xs font-sans text-gray-500 italic">
              Disabled in Mock Mode
            </span>
          )}
        </div>
      </div>

      {/* Hardware Connection Status (Border Top) */}
      <div className="pt-4 border-t border-slate-300/30 flex flex-col gap-3">
        <span className="text-sm font-bold font-sans text-zinc-900">
          Hardware Connection Status
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Detection Status Box */}
          <div className="p-3 bg-gray-100 rounded-md outline outline-1 outline-slate-300/30 flex justify-between items-center h-[42px]">
            <span className="text-base font-normal font-sans text-gray-700">
              Detection Status
            </span>
            <div className="flex items-center gap-2">
              {/* TODO: Dynamically display detected hardware device name from GET /api/v1/hardware/status */}
              <span className="text-base font-bold font-sans text-zinc-900">
                Raspberry Pi
              </span>
              <div className="px-2 py-0.5 bg-green-100 rounded-sm outline outline-1 outline-green-200 flex items-center gap-1">
                <div className="size-2 bg-green-800 rounded-full" />
                <span className="text-xs font-semibold font-sans tracking-wide text-green-800">
                  Detected
                </span>
              </div>
            </div>
          </div>

          {/* IP Address & Test Connection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide font-sans text-gray-700">
              IP Address
            </label>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-md outline outline-1 outline-slate-300/50">
                    <input
                      type="text"
                      value={ipAddress}
                      onChange={(e) => {
                        onIpAddressChange(e.target.value);
                        setTestResult(null);
                      }}
                      placeholder="192.168.137.251:8080"
                      className="w-full bg-transparent text-sm font-medium font-mono text-gray-700 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isTesting}
                    onClick={handleTest}
                    className="px-4 py-2 rounded-md outline outline-1 outline-sky-700 text-sky-700 text-sm font-bold font-sans hover:bg-sky-50 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <span>Test Connection</span>
                    )}
                  </button>
                </div>
                {testResult && (
                  <div
                    className={`mt-1 text-xs px-2.5 py-1.5 rounded flex items-center gap-1.5 ${
                      testResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                    {testResult.latency !== undefined && (
                      <span className="font-mono text-[11px] font-semibold">
                        ({testResult.latency} ms)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

