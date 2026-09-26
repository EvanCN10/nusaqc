"use client";

import { useEffect, useState } from "react";
import { Hardware } from "@/components/sections/settings-page/Hardware";
import { AIModel } from "@/components/sections/settings-page/AIModel";
import { ExportSettings } from "@/components/sections/settings-page/ExportSettings";
import { BottomSection } from "@/components/sections/settings-page/BottomSection";
import { fetchSettings, saveSettings } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEFAULT_SETTINGS = {
  mockMode: true,
  cameraSource: "mock",
  ipAddress: "192.168.137.251:8080",
  confidenceThreshold: 65,
  autoExportCSV: false,
  logRetention: "7",
};

export default function SettingsPage() {
  const { user } = useAuth();

  const [mockMode, setMockMode] = useState(DEFAULT_SETTINGS.mockMode);
  const [cameraSource, setCameraSource] = useState(DEFAULT_SETTINGS.cameraSource);
  const [ipAddress, setIpAddress] = useState(DEFAULT_SETTINGS.ipAddress);
  const [confidenceThreshold, setConfidenceThreshold] = useState(DEFAULT_SETTINGS.confidenceThreshold);
  const [autoExportCSV, setAutoExportCSV] = useState(DEFAULT_SETTINGS.autoExportCSV);
  const [logRetention, setLogRetention] = useState(DEFAULT_SETTINGS.logRetention);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Instant synchronous read from localStorage cache
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nusaqc_mock_mode");
      if (cached !== null) {
        setMockMode(cached === "true");
      }
    }

    const loadInitSettings = async () => {
      try {
        const res = await fetchSettings();
        if (isMounted && res) {
          const hasMock = res.mock_mode_enabled !== undefined || res.mockMode !== undefined || res.mockModeEnabled !== undefined;
          if (hasMock) {
            const serverVal = Boolean(res.mock_mode_enabled ?? res.mockMode ?? res.mockModeEnabled);
            setMockMode(serverVal);
            if (typeof window !== "undefined") {
              localStorage.setItem("nusaqc_mock_mode", String(serverVal));
            }
          }
          if (res.camera_source) setCameraSource(res.camera_source);
          if (res.raspberry_pi_ip) setIpAddress(res.raspberry_pi_ip);
          if (res.confidence_threshold !== undefined || res.confidenceThreshold !== undefined) {
            const rawThresh = Number(res.confidenceThreshold ?? res.confidence_threshold);
            setConfidenceThreshold(rawThresh <= 1.0 ? Math.round(rawThresh * 100) : Math.round(rawThresh));
          }
          if (res.auto_export_csv !== undefined) setAutoExportCSV(Boolean(res.auto_export_csv));
          if (res.log_retention_days) setLogRetention(String(res.log_retention_days));
        }
      } catch (err) {
        console.warn("Failed to fetch initial settings:", err);
      }
    };

    loadInitSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMockModeChange = async (val: boolean) => {
    setMockMode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("nusaqc_mock_mode", String(val));
    }
    try {
      await saveSettings({
        mock_mode_enabled: val,
        mockModeEnabled: val,
        mockMode: val,
      });
      setSaveMessage({
        type: "success",
        text: `Mock Hardware Mode berhasil diubah ke: ${val ? "ON (Mode Simulasi)" : "OFF (Mode Hardware RPi)"}`
      });
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      console.warn("Auto-save mock mode error:", err);
    }
  };

  const handleSave = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nusaqc_mock_mode", String(mockMode));
    }
    try {
      await saveSettings({
        mock_mode_enabled: mockMode,
        mockModeEnabled: mockMode,
        mockMode: mockMode,
        camera_source: cameraSource,
        raspberry_pi_ip: ipAddress,
        confidence_threshold: confidenceThreshold,
        auto_export_csv: autoExportCSV,
        log_retention_days: Number(logRetention) || 7,
      });
      setSaveMessage({ type: "success", text: "Semua pengaturan sistem berhasil disimpan ke backend!" });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      setSaveMessage({ type: "error", text: "Gagal menyimpan pengaturan ke backend." });
    }
  };
  const handleReset = () => {
    setMockMode(DEFAULT_SETTINGS.mockMode);
    setCameraSource(DEFAULT_SETTINGS.cameraSource);
    setIpAddress(DEFAULT_SETTINGS.ipAddress);
    setConfidenceThreshold(DEFAULT_SETTINGS.confidenceThreshold);
    setAutoExportCSV(DEFAULT_SETTINGS.autoExportCSV);
    setLogRetention(DEFAULT_SETTINGS.logRetention);
    setSaveMessage(null);
  };

  // RBAC Access Guard: Block Operator role from viewing or editing settings
  if (user?.role === "operator") {
    return (
      <div className="flex flex-col items-center justify-center p-12 max-w-xl mx-auto min-h-[60vh] text-center">
        <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <ShieldAlert className="size-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-sans">Akses Halaman Dibatasi</h2>
        <p className="text-sm text-slate-600 mt-2 font-sans">
          Sesi Anda saat ini (<strong>QC Operator</strong>) tidak memiliki izin untuk mengonfigurasi parameter sistem hardware dan AI model. Halaman ini hanya dapat diakses oleh <strong>QC Supervisor</strong> atau <strong>System Admin</strong>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {saveMessage && (
        <div
          className={`p-3 rounded-md border flex items-center gap-2 text-sm font-sans ${
            saveMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <Hardware
        mockMode={mockMode}
        onMockModeChange={handleMockModeChange}
        cameraSource={cameraSource}
        onCameraSourceChange={setCameraSource}
        ipAddress={ipAddress}
        onIpAddressChange={setIpAddress}
      />

      <AIModel
        confidenceThreshold={confidenceThreshold}
        onConfidenceChange={setConfidenceThreshold}
      />

      <ExportSettings
        autoExportCSV={autoExportCSV}
        onAutoExportChange={setAutoExportCSV}
        logRetention={logRetention}
        onLogRetentionChange={setLogRetention}
      />

      <BottomSection onSave={handleSave} onReset={handleReset} />
    </div>
  );
}
