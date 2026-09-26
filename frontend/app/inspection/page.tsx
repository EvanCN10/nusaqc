"use client";

import { useState, useCallback, useEffect } from "react";
import { FishInspection } from "@/components/sections/inspection-page/FishInspection";
import { ResultSection } from "@/components/sections/inspection-page/ResultSection";
import { useInspectionWebSocket } from "@/lib/useWebSocket";
import { fetchSettings, saveSettings } from "@/lib/api";
import { InspectionResult } from "@/types";
import { Radio, Wifi, WifiOff, MonitorSmartphone, Cpu } from "lucide-react";

export default function InspectionPage() {
  const [mockMode, setMockMode] = useState<boolean>(false); // default to false (hardware mode)
  const [isModeLoaded, setIsModeLoaded] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch mock mode from localStorage and backend settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nusaqc_mock_mode");
      if (cached !== null) {
        setMockMode(cached === "true");
        setIsModeLoaded(true);
      }
    }
    const loadMode = async () => {
      try {
        const res = await fetchSettings();
        const mode = Boolean(res.mock_mode_enabled ?? res.mockMode ?? res.mockModeEnabled ?? false);
        setMockMode(mode);
        if (typeof window !== "undefined") {
          localStorage.setItem("nusaqc_mock_mode", String(mode));
        }
      } catch {
        // fallback
      } finally {
        setIsModeLoaded(true);
      }
    };
    loadMode();
  }, []);

  const handleToggleMockMode = async () => {
    const nextMode = !mockMode;
    setMockMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("nusaqc_mock_mode", String(nextMode));
    }
    try {
      await saveSettings({
        mock_mode_enabled: nextMode,
        mockModeEnabled: nextMode,
        mockMode: nextMode,
      });
    } catch (err) {
      console.warn("Failed to toggle mock mode from inspection header:", err);
    }
  };
  const handleStart = () => {
    setIsLoading(true);
    setErrorMessage(null);
  };

  const handleComplete = (result: InspectionResult) => {
    setIsLoading(false);
    setInspectionResult(result);
    setErrorMessage(null);
  };

  const handleError = (error: string) => {
    setIsLoading(false);
    setErrorMessage(error);
  };

  // Real-time receiver for IoT Edge conveyor triggers
  const handleNewInspection = useCallback((data: InspectionResult) => {
    setInspectionResult(data);
    setIsLoading(false);
    setErrorMessage(null);
  }, []);

  const { isConnected: isWsConnected } = useInspectionWebSocket(handleNewInspection);

  return (
    <div className="flex flex-col gap-4 p-6 w-full max-w-7xl mx-auto">
      {/* IoT / Mock Mode Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          {mockMode ? (
            <>
              <MonitorSmartphone className="size-3.5 text-amber-500" />
              <span className="font-semibold text-slate-800">
                Mode Simulasi — Gunakan Webcam Laptop atau Unggah Gambar
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-500 hidden sm:inline">
                Kamera IoT / RPi 4 tidak aktif dalam mock mode
              </span>
            </>
          ) : (
            <>
              <div
                className={`size-2.5 rounded-full ${
                  isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="font-semibold text-slate-800">
                {isWsConnected ? "IoT Stream & Telemetry Bridge: ACTIVE" : "Connecting to IoT WebSocket Bridge..."}
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-500 hidden sm:inline">
                Menerima siaran otomatis saat konveyor / sensor E18-D80NK aktif
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {inspectionResult?.lotId && (
            <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px] border border-sky-200">
              Lot Terkini: {inspectionResult.lotId}
            </span>
          )}
          {/* Mode Toggle Button: Click to switch modes immediately */}
          <button
            type="button"
            onClick={handleToggleMockMode}
            title="Klik untuk beralih antara Mode Simulasi dan Mode Hardware"
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer hover:shadow-xs active:scale-95 ${
              mockMode
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            {mockMode ? (
              <>
                <MonitorSmartphone className="size-3 text-amber-600" />
                <span className="font-bold">MOCK MODE</span>
                <span className="text-[10px] text-amber-600 font-sans hidden sm:inline">(Klik ubah ke Hardware)</span>
              </>
            ) : (
              <>
                <Cpu className="size-3 text-emerald-600" />
                <span className="font-bold">HARDWARE MODE</span>
                <span className="text-[10px] text-emerald-600 font-sans hidden sm:inline">(Klik ubah ke Mock)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 w-full">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <FishInspection
            onInspectionStart={handleStart}
            onInspectionComplete={handleComplete}
            onError={handleError}
            lastResult={inspectionResult}
            isLoading={isLoading}
            isWsConnected={isWsConnected}
            mockMode={mockMode}
            isModeLoaded={isModeLoaded}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <ResultSection
            result={inspectionResult}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
