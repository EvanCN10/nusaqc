"use client";

import React, { useRef, useState } from "react";
import { Camera, Plus, Loader2, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runInspection } from "@/lib/api";
import { InspectionResult } from "@/types";

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
      naturalHeight: img.naturalHeight || 640,
    });
  };

  const handleReInspect = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageDimensions(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Quick Demo Fish Generator for rapid testing without external files
  const handleLoadSampleCanvas = (type: "healthy" | "defect") => {
    setLocalError(null);
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Gradient background simulating stainless conveyor
    const bgGradient = ctx.createLinearGradient(0, 0, 640, 480);
    bgGradient.addColorStop(0, "#cbd5e1");
    bgGradient.addColorStop(1, "#94a3b8");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 640, 480);

    // Draw conveyor grid lines
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }

    // Fish Body
    ctx.save();
    ctx.translate(320, 240);
    ctx.beginPath();
    ctx.ellipse(0, 0, 210, 75, 0, 0, 2 * Math.PI);
    const fishGradient = ctx.createLinearGradient(-200, 0, 200, 0);
    fishGradient.addColorStop(0, type === "healthy" ? "#0284c7" : "#0369a1");
    fishGradient.addColorStop(0.5, type === "healthy" ? "#e0f2fe" : "#fed7aa");
    fishGradient.addColorStop(1, type === "healthy" ? "#38bdf8" : "#94a3b8");
    ctx.fillStyle = fishGradient;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    // Fish Eye
    ctx.beginPath();
    ctx.arc(140, -15, 12, 0, 2 * Math.PI);
    ctx.fillStyle = type === "healthy" ? "#000000" : "#7f1d1d";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(143, -17, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Fish Tail
    ctx.beginPath();
    ctx.moveTo(-190, 0);
    ctx.lineTo(-260, -50);
    ctx.lineTo(-240, 0);
    ctx.lineTo(-260, 50);
    ctx.closePath();
    ctx.fillStyle = "#0284c7";
    ctx.fill();
    ctx.stroke();

    // If defective, paint a simulated red lesion / color defect
    if (type === "defect") {
      ctx.beginPath();
      ctx.ellipse(-20, 10, 35, 20, 0.2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
      ctx.fill();

      // Slime spot
      ctx.beginPath();
      ctx.ellipse(60, -10, 25, 12, -0.3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
      ctx.fill();
    }
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `sample_${type}_fish.jpg`, { type: "image/jpeg" });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }, "image/jpeg", 0.95);
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
        // Fetch blob from previewUrl if generated from demo
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        fileToSend = new File([blob], `fish_sample.jpg`, { type: "image/jpeg" });
      }

      if (!fileToSend) {
        throw new Error("Berkas gambar tidak ditemukan.");
      }

      const result = await runInspection(fileToSend, "Universal");
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
        <span className="text-xs font-mono px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full font-medium border border-sky-200">
          Dual ONNX Runtime (CPU)
        </span>
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

      {/* Quick Demo Sample Picker */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 font-sans flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" /> Demo Sample:
          </span>
          <button
            type="button"
            onClick={() => handleLoadSampleCanvas("healthy")}
            className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-sm font-medium hover:bg-green-100 transition-colors cursor-pointer"
          >
            Ikan Segar (Grade A)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSampleCanvas("defect")}
            className="text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-sm font-medium hover:bg-red-100 transition-colors cursor-pointer"
          >
            Ikan Cacat (Defect)
          </button>
        </div>

        {previewUrl && (
          <Button
            variant="outline-sky"
            onClick={handleReInspect}
            disabled={isLoading}
            className="h-[32px] px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Reset</span>
          </Button>
        )}
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
