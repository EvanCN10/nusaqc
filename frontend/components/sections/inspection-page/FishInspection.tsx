"use client";

import React, { useRef, useState } from "react";
import { Camera, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runInspection } from "@/lib/api";
import { InspectionResult } from "@/types";

const FISH_FAMILIES = [
  "Scombridae",
  "Cichlidae",
  "Salmonidae",
  // TODO: Replace with dynamic options from GET /api/v1/fish-families
];

interface FishInspectionProps {
  onInspectionComplete?: (result: InspectionResult) => void;
}

export const FishInspection = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string>("Scombridae");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    // TODO: Store File object to send with POST /api/v1/inspections/run
    // Request body: { family: selectedFamily, image: file }
  };

  const handleReInspect = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Camera className="size-5 text-sky-700" />
        <h2 className="text-xl font-bold font-sans text-zinc-900">Fish Inspection</h2>
      </div>

      {/* Upload Area / Image Preview */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Fish sample preview"
          className="w-full h-72 object-cover rounded-sm outline outline-1 outline-slate-300"
        />
      ) : (
        <div
          onClick={handleUploadClick}
          className="w-full h-72 bg-gray-200 rounded-sm outline outline-1 outline-slate-900 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors"
        >
          <Plus className="size-9 text-slate-900" />
          <p className="text-base font-bold font-sans text-gray-700">
            Trigger Camera / Upload File (Mock Mode)
          </p>
          <p className="text-sm font-normal font-sans text-gray-700 text-center max-w-xs">
            Click here to upload a fish sample (JPG/PNG) or connect to the industrial camera feed.
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
        // TODO: In camera mode, this input will be replaced by a WebSocket feed — WS /ws/camera-feed
      />

      {/* Controls Row */}
      <div className="flex items-end gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs font-semibold font-sans text-gray-700 tracking-wide">
            Family Select
          </label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 text-sm font-sans text-zinc-900 cursor-pointer"
          >
            {FISH_FAMILIES.map((family) => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>

        <Button
          variant="outline-sky"
          onClick={handleReInspect}
          className="flex-1 h-[38px]"
        >
          Re-inspect
        </Button>
      </div>

      {/* Run Inspection */}
      <Button
        variant="primary"
        size="lg"
        className="w-full uppercase tracking-wide font-semibold"
        onClick={() => {
          // TODO: POST /api/v1/inspections/run
          // Request body: { family: selectedFamily, image: <File object> }
          // Expected response: { grade, decision, confidence, defects[], lotId }
          // On success: pass result to ResultSection via shared state or context
          console.log("Run inspection →", { family: selectedFamily, hasImage: !!previewUrl });
        }}
      >
        Run Inspection
      </Button>
    </div>
  );
};
