"use client";

import { useState } from "react";
import { Hardware } from "@/components/sections/settings-page/Hardware";
import { AIModel } from "@/components/sections/settings-page/AIModel";
import { ExportSettings } from "@/components/sections/settings-page/ExportSettings";
import { BottomSection } from "@/components/sections/settings-page/BottomSection";

const DEFAULT_SETTINGS = {
  mockMode: true,
  cameraSource: "mock",
  ipAddress: "192.168.1.42",
  confidenceThreshold: 65,
  activeSpecies: ["Scombridae", "Cichlidae"],
  autoExportCSV: false,
  logRetention: "7",
};

export default function SettingsPage() {
  // TODO: Load initial settings from GET /api/v1/settings on component mount
  const [mockMode, setMockMode] = useState(DEFAULT_SETTINGS.mockMode);
  const [cameraSource, setCameraSource] = useState(DEFAULT_SETTINGS.cameraSource);
  const [ipAddress, setIpAddress] = useState(DEFAULT_SETTINGS.ipAddress);
  const [confidenceThreshold, setConfidenceThreshold] = useState(
    DEFAULT_SETTINGS.confidenceThreshold
  );
  const [activeSpecies, setActiveSpecies] = useState<string[]>(
    DEFAULT_SETTINGS.activeSpecies
  );
  const [autoExportCSV, setAutoExportCSV] = useState(DEFAULT_SETTINGS.autoExportCSV);
  const [logRetention, setLogRetention] = useState(DEFAULT_SETTINGS.logRetention);

  const handleSave = () => {
    // TODO: Send settings payload to PUT /api/v1/settings API
    console.log("Saving settings payload:", {
      mockMode,
      cameraSource,
      ipAddress,
      confidenceThreshold,
      activeSpecies,
      autoExportCSV,
      logRetention,
    });
  };

  const handleReset = () => {
    setMockMode(DEFAULT_SETTINGS.mockMode);
    setCameraSource(DEFAULT_SETTINGS.cameraSource);
    setIpAddress(DEFAULT_SETTINGS.ipAddress);
    setConfidenceThreshold(DEFAULT_SETTINGS.confidenceThreshold);
    setActiveSpecies(DEFAULT_SETTINGS.activeSpecies);
    setAutoExportCSV(DEFAULT_SETTINGS.autoExportCSV);
    setLogRetention(DEFAULT_SETTINGS.logRetention);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1040px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-sans text-zinc-900">
          System Settings
        </h1>
        <p className="text-sm font-sans text-gray-500">
          Configure hardware connections, AI inference parameters, and export logs
        </p>
      </div>

      <Hardware
        mockMode={mockMode}
        onMockModeChange={setMockMode}
        cameraSource={cameraSource}
        onCameraSourceChange={setCameraSource}
        ipAddress={ipAddress}
        onIpAddressChange={setIpAddress}
      />

      <AIModel
        confidenceThreshold={confidenceThreshold}
        onConfidenceChange={setConfidenceThreshold}
        activeSpecies={activeSpecies}
        onSpeciesChange={setActiveSpecies}
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