"use client";

import React, { useRef, useState } from "react";
import { Camera, Plus, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runInspection } from "@/lib/api";
import { InspectionResult } from "@/types";

export const FISH_FAMILIES = [
  { id: "Scombridae", label: "Scombridae (Tuna, Mackerel / Kembung, Tongkol)" },
  { id: "Cichlidae", label: "Cichlidae (Tilapia / Nila)" },
];

// Color mapping for defect bounding boxes
const DEFECT_COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  sisik_sisa: { border: "border-amber-500", bg: "bg-amber-600", text: "text-white" },
  warna_abnormal: { border: "border-red-600", bg: "bg-red-600", text: "text-white" },
  luka_robekan: { border: "border-yellow-500", bg: "bg-yellow-600", text: "text-white" },
  lendir_berlebih: { border: "border-purple-600", bg: "bg-purple-600", text: "text-white" },
};

interface FishInspectionProps {
  onInspectionStart?: () => void;
  onInspectionComplete?: (result: InspectionResult) => void;
  onError?: (errorMessage: string) => void;
  lastResult?: InspectionResult | null;
  isLoading?: boolean;
}

export const FishInspection = ({
  onInspectionStart,
  onInspectionComplete,
  onError,
  lastResult,
  isLoading = false,
}: FishInspectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string>("Scombridae");
  const [imageDimensions, setImageDimensions] = useState<{ naturalWidth: number; naturalHeight: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    setLocalError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Format berkas tidak valid. Harap pilih gambar JPG, PNG, atau WEBP.");
      return;
    }

    setLocalError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      naturalWidth: img.naturalWidth || 640,
      naturalHeight: img.naturalHeight || 480,
    });
  };

  const handleReInspect = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageDimensions(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRunInspection = async () => {
    if (!selectedFile && !previewUrl) {
      setLocalError("Pilih atau unggah foto sampel ikan terlebih dahulu.");
      return;
    }

    setLocalError(null);
    onInspectionStart?.();

    try {
      let fileToSend = selectedFile;
      if (!fileToSend && previewUrl) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        fileToSend = new File([blob], `fish_${selectedFamily.toLowerCase()}.jpg`, { type: "image/jpeg" });
      }

      if (!fileToSend) {
        throw new Error("Berkas gambar tidak ditemukan.");
      }

      const result = await runInspection(fileToSend, selectedFamily);
      onInspectionComplete?.(result);
    } catch (err: any) {
      const msg = err?.message || "Gagal melakukan inspeksi AI. Pastikan backend aktif.";
      setLocalError(msg);
      onError?.(msg);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="size-5 text-sky-700" />
          <h2 className="text-xl font-bold font-sans text-zinc-900">Fish Inspection</h2>
        </div>
        <div className="flex items-center gap-2">
          {previewUrl && (
            <Button
              variant="outline-sky"
              onClick={handleReInspect}
              disabled={isLoading}
              className="h-[30px] px-2.5 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="size-3" />
              <span>Ganti Foto</span>
            </Button>
          )}
          <span className="text-xs font-mono px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full font-medium border border-sky-200">
            Dual ONNX Runtime (CPU)
          </span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{localError}</span>
        </div>
      )}

      {/* Upload Area / Image Preview with Bounding Box Overlay */}
      <div className="relative w-full h-80 bg-slate-900 rounded-md outline outline-1 outline-slate-300 overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Fish sample preview"
              onLoad={handleImageLoaded}
              className="w-full h-full object-contain"
            />

            {/* Dynamic YOLOv8 Bounding Box Overlays */}
            {lastResult && lastResult.defects && lastResult.defects.length > 0 && imageDimensions && (
              <div className="absolute inset-0 pointer-events-none">
                {lastResult.defects.map((defect, idx) => {
                  const [x1, y1, x2, y2] = defect.bbox;
                  const nw = imageDimensions.naturalWidth || 640;
                  const nh = imageDimensions.naturalHeight || 480;

                  const leftPct = (x1 / nw) * 100;
                  const topPct = (y1 / nh) * 100;
                  const widthPct = Math.max(2, ((x2 - x1) / nw) * 100);
                  const heightPct = Math.max(2, ((y2 - y1) / nh) * 100);

                  const styleInfo = DEFECT_COLOR_MAP[defect.label] || {
                    border: "border-red-600",
                    bg: "bg-red-600",
                    text: "text-white",
                  };

                  return (
                    <div
                      key={`${defect.label}-${idx}`}
                      className={`absolute border-2 ${styleInfo.border} rounded-xs transition-all`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                    >
                      <span
                        className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-mono font-bold ${styleInfo.bg} ${styleInfo.text} rounded-xs shadow-sm whitespace-nowrap`}
                      >
                        {defect.label} {(defect.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-slate-100 transition-colors p-6 text-center"
          >
            <div className="size-14 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Plus className="size-8 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-base font-bold font-sans text-zinc-900">
                Trigger Snapshot / Upload Fish Sample
              </p>
              <p className="text-xs font-normal font-sans text-gray-500 max-w-sm mt-1">
                Ambil snapshot dari kamera conveyor atau unggah foto sampel ikan (JPEG/PNG/WEBP).
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20">
            <Loader2 className="size-9 animate-spin text-sky-400" />
            <div className="text-center">
              <p className="text-sm font-semibold font-sans">Mengeksekusi Inferensi AI...</p>
              <p className="text-xs font-mono text-slate-300">MobileNetV3 (Freshness) + YOLOv8s (Defects)</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Controls Row: Fish Family Selector */}
      <div className="flex items-end gap-4 pt-2 border-t border-slate-100">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs font-bold font-sans text-gray-700 tracking-wide">
            Famili Ikan (Traceability Category)
          </label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 text-sm font-sans font-medium text-zinc-900 cursor-pointer focus:outline-sky-500"
          >
            {FISH_FAMILIES.map((f) => (
              <option key={f.id} value={f.id} className="font-sans text-zinc-900">
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Run Inspection Button */}
      <Button
        variant="primary"
        size="lg"
        disabled={isLoading || (!previewUrl && !selectedFile)}
        className="w-full uppercase tracking-wide font-bold flex items-center justify-center gap-2 py-3 cursor-pointer mt-1"
        onClick={handleRunInspection}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>Memproses Inferensi AI...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-5" />
            <span>Jalankan Inspeksi AI (Run Inspection)</span>
          </>
        )}
      </Button>
    </div>
  );
};
