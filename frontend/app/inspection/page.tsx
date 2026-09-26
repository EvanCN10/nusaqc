"use client";

import { useState, useCallback, useEffect } from "react";
import { FishInspection } from "@/components/sections/inspection-page/FishInspection";
import { ResultSection } from "@/components/sections/inspection-page/ResultSection";
import { useInspectionWebSocket } from "@/lib/useWebSocket";
import { fetchSettings, saveSettings } from "@/lib/api";
import { InspectionResult } from "@/types";
import { Radio, Wifi, WifiOff, MonitorSmartphone, Cpu, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function InspectionPage() {
  const [mockMode, setMockMode] = useState<boolean>(false); // default to false (hardware mode)
  const [isModeLoaded, setIsModeLoaded] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Toast Notification for real-time continuous stream detections
  const [toastNotification, setToastNotification] = useState<{
    result: InspectionResult;
    id: number;
  } | null>(null);

  // Auto-dismiss toast notification after 5 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

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
    setToastNotification({ result, id: Date.now() });
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
    setToastNotification({ result: data, id: Date.now() });
  }, []);

  const { isConnected: isWsConnected } = useInspectionWebSocket(handleNewInspection);

  return (
    <div className="flex flex-col gap-4 p-6 w-full max-w-7xl mx-auto relative">
      {/* FLOATING LIVE INSPECTION TOAST NOTIFICATION (Top-Right) */}
      {toastNotification && (
        <aside
          aria-label="Notifikasi Hasil Inspeksi"
          className="fixed top-6 right-6 z-50 w-88 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xl p-4 transition-all duration-300 animate-in slide-in-from-top-4 fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  toastNotification.result.decision === "PASS"
                    ? "bg-emerald-500 animate-ping"
                    : toastNotification.result.decision === "FAIL"
                    ? "bg-rose-500 animate-ping"
                    : "bg-amber-400 animate-ping"
                }`}
              />
              <span className="font-mono text-xs font-bold text-slate-800">
                {toastNotification.result.lotId || toastNotification.result.lot_id || "LOT TERBARU"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 text-xs font-black rounded-md tracking-wide ${
                  toastNotification.result.decision === "PASS"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : toastNotification.result.decision === "FAIL"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {toastNotification.result.decision}
              </span>
              <span className="text-xs font-bold font-sans text-slate-700">
                Grade {toastNotification.result.grade || "A"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <span
                className={`size-2 rounded-full ${
                  toastNotification.result.hardware_signal === "GREEN"
                    ? "bg-emerald-500"
                    : toastNotification.result.hardware_signal === "RED"
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
              />
              <span>
                {toastNotification.result.hardware_signal === "GREEN"
                  ? "Conveyor Jalan"
                  : "Conveyor Stop"}
              </span>
            </div>
          </div>

          {toastNotification.result.reason_summary && (
            <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 italic font-sans">
              {toastNotification.result.reason_summary}
            </p>
          )}
        </aside>
      )}

      {/* IoT / Mock Mode Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          {mockMode ? (
            <>
              <MonitorSmartphone className="size-3.5 text-amber-500" />
              <span className="font-semibold text-slate-800">
                Mode Simulasi - Gunakan Webcam Laptop atau Unggah Gambar
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
