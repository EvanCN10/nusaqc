"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  Plus,
  Loader2,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Video,
  X,
  FlipHorizontal,
  CircleDot,
  Radio,
  Tv,
  Wifi,
  WifiOff,
  Settings2,
  Sliders,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runInspection, getFullImageUrl, API_BASE } from "@/lib/api";
import { InspectionResult } from "@/types";

export const FISH_TYPES = [
  { id: "Tuna", label: "Tuna (Thunnini / Tuna)" },
  { id: "Mackarel", label: "Mackarel (Scomber / Mackarel / Kembung)" },
  { id: "Nila", label: "Nila (Oreochromis niloticus / Tilapia)" },
];

export const FISH_FAMILIES = FISH_TYPES;

// Color mapping for defect bounding boxes
const DEFECT_COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  sisik_sisa: {
    border: "border-amber-400",
    bg: "bg-amber-400",
    text: "text-zinc-900",
  },
  warna_abnormal: {
    border: "border-purple-400",
    bg: "bg-purple-400",
    text: "text-white",
  },
  luka_robekan: {
    border: "border-rose-500",
    bg: "bg-rose-500",
    text: "text-white",
  },
  lendir_berlebih: {
    border: "border-sky-400",
    bg: "bg-sky-400",
    text: "text-zinc-900",
  },
  parasite: {
    border: "border-amber-400",
    bg: "bg-amber-400",
    text: "text-zinc-900",
  },
  discoloration: {
    border: "border-purple-400",
    bg: "bg-purple-400",
    text: "text-white",
  },
  lesion: {
    border: "border-rose-500",
    bg: "bg-rose-500",
    text: "text-white",
  },
  slime: {
    border: "border-sky-400",
    bg: "bg-sky-400",
    text: "text-zinc-900",
  },
};

type ViewMode = "idle" | "edge" | "webcam" | "result";

type FishInspectionProps = {
  onInspectionStart?: () => void;
  onInspectionComplete?: (result: InspectionResult) => void;
  onError?: (error: string) => void;
  lastResult?: InspectionResult | null;
  isLoading?: boolean;
  isWsConnected?: boolean;
  /** From Settings: when true = mock mode (no RPi), when false = hardware mode (use IoT stream) */
  mockMode?: boolean;
  /** True after the first settings fetch completes, prevents premature auto-switch */
  isModeLoaded?: boolean;
};

export const FishInspection = ({
  onInspectionStart,
  onInspectionComplete,
  onError,
  lastResult,
  isLoading = false,
  isWsConnected = false,
  mockMode = true,
  isModeLoaded = false,
}: FishInspectionProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(mockMode ? "idle" : "edge");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFishType, setSelectedFishType] = useState<string>("Tuna");
  const [imageDimensions, setImageDimensions] = useState<{ naturalWidth: number; naturalHeight: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  // IoT Edge Stream state
  const defaultEdgeHost = process.env.NEXT_PUBLIC_EDGE_HOST || "192.168.137.251:8080";
  const [edgeHost, setEdgeHost] = useState<string>(defaultEdgeHost);
  const [isEditingEdgeHost, setIsEditingEdgeHost] = useState<boolean>(false);
  const [edgeInputHost, setEdgeInputHost] = useState<string>(defaultEdgeHost);
  const [isEdgeOnline, setIsEdgeOnline] = useState<boolean>(true);
  const [isCapturingEdge, setIsCapturingEdge] = useState<boolean>(false);
  const [useProxyStream, setUseProxyStream] = useState<boolean>(true);
  // Local Webcam stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  // Direct edge stream url (browser -> RPi directly, zero proxy overhead) vs Next.js proxy fallback
  const directEdgeStreamUrl = `http://${edgeHost}/stream`;
  const proxyEdgeStreamUrl = `/api/iot/stream?host=${encodeURIComponent(edgeHost)}`;
  const edgeStreamUrl = useProxyStream ? proxyEdgeStreamUrl : directEdgeStreamUrl;

  // Auto-switch view mode when loaded or when mockMode changes
  useEffect(() => {
    if (!isModeLoaded) return;
    if (!previewUrl && !isCameraActive) {
      if (mockMode) {
        setViewMode("idle");
        stopCameraStream();
      } else {
        setViewMode("edge");
        setIsEdgeOnline(true);
        stopCameraStream();
      }
    }
  }, [isModeLoaded, mockMode, previewUrl, isCameraActive, stopCameraStream]);

  // Sync incoming inspection result from WebSocket or parent
  useEffect(() => {
    if (lastResult?.imageUrl) {
      const fullUrl = getFullImageUrl(lastResult.imageUrl);
      setPreviewUrl(fullUrl);
      setViewMode("result");
      stopCameraStream();
    }
  }, [lastResult, stopCameraStream]);
  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Start local webcam stream
  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    setLocalError(null);
    setIsCameraLoading(true);
    stopCameraStream();
    setViewMode("webcam");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser Anda tidak mendukung akses kamera langsung (WebRTC).");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setFacingMode(mode);
    } catch (err: unknown) {
      console.warn("Camera access error:", err);
      let message = "Gagal mengakses kamera. Pastikan izin kamera telah diberikan.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message = "Akses kamera ditolak oleh browser. Mohon izinkan akses kamera di pengaturan browser.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "Kamera tidak terdeteksi pada perangkat ini.";
        }
      }
      setLocalError(message);
      setIsCameraActive(false);
      setViewMode("idle");
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Ensure video stream connects reliably as soon as video element is mounted
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      const video = videoRef.current;
      video.srcObject = mediaStreamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.warn("Video play error:", err));
      };
    }
  }, [isCameraActive]);

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  };

  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setLocalError("Gagal mengambil snapshot dari video feed.");
          return;
        }

        const filename = `camera_snapshot_${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(blob);

        setSelectedFile(file);
        setPreviewUrl(objectUrl);
        setViewMode("result");
        stopCameraStream();
        setLocalError(null);
      },
      "image/jpeg",
      0.92
    );
  };

  // Start IoT Edge Stream
  const handleStartEdgeStream = () => {
    stopCameraStream();
    setPreviewUrl(null);
    setLocalError(null);
    setUseProxyStream(false);
    setIsEdgeOnline(true);
    setViewMode("edge");
  };

  // Capture frame directly from IoT Edge Node and trigger inspection
  const handleCaptureEdgeSnapshotAndInspect = async () => {
    setIsCapturingEdge(true);
    setLocalError(null);
    onInspectionStart?.();

    try {
      // 1. Fetch snapshot: Try direct edge snapshot first (has CORS headers), fallback to Next.js API proxy
      let blob: Blob;
      try {
        const directResp = await fetch(`http://${edgeHost}/snapshot?_=${Date.now()}`, {
          cache: "no-store",
          mode: "cors",
        });
        if (!directResp.ok) throw new Error(`Direct snapshot HTTP ${directResp.status}`);
        blob = await directResp.blob();
      } catch {
        const proxyResp = await fetch(`/api/iot/snapshot?host=${encodeURIComponent(edgeHost)}&_=${Date.now()}`, {
          cache: "no-store",
        });
        if (!proxyResp.ok) {
          throw new Error(`Edge node tidak merespons. Pastikan Raspberry Pi 4 menyala di http://${edgeHost}`);
        }
        blob = await proxyResp.blob();
      }

      const file = new File([blob], `iot_edge_snap_${Date.now()}.jpg`, { type: "image/jpeg" });

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);

      // 2. Run inspection on backend
      const result = await runInspection(file, selectedFishType);
      setViewMode("result");
      onInspectionComplete?.(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengambil frame dari IoT Edge camera.";
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setIsCapturingEdge(false);
    }
  };

  const handleUploadClick = () => {
    setLocalError(null);
    stopCameraStream();
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
    setViewMode("result");
    stopCameraStream();
  };

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      naturalWidth: img.naturalWidth || 640,
      naturalHeight: img.naturalHeight || 480,
    });
  };

  const handleLoadPreset = async (sampleId: string, fishType: string) => {
    setLoadingPreset(sampleId);
    setLocalError(null);
    stopCameraStream();

    try {
      const res = await fetch(`${API_BASE}/api/v1/jury/sample/${sampleId}`);
      if (!res.ok) {
        throw new Error(`Gagal memuat preset sampel (Status: ${res.status})`);
      }
      const blob = await res.blob();
      const filename = `jury_${sampleId}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });
      const objectUrl = URL.createObjectURL(blob);

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setSelectedFishType(fishType);
      setViewMode("result");
    } catch (err: any) {
      setLocalError(err.message || "Gagal memuat sampel uji juri.");
    } finally {
      setLoadingPreset(null);
    }
  };

  const handleResetToIdle = () => {
    stopCameraStream();
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageDimensions(null);
    setLocalError(null);
    if (mockMode) {
      setViewMode("idle");
    } else {
      setViewMode("edge");
      setIsEdgeOnline(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRunInspection = async () => {
    if (!selectedFile && !previewUrl) {
      setLocalError("Pilih, foto, atau unggah sampel ikan terlebih dahulu.");
      return;
    }

    setLocalError(null);
    onInspectionStart?.();

    try {
      let fileToSend = selectedFile;
      if (!fileToSend && previewUrl) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        fileToSend = new File([blob], `fish_${selectedFishType.toLowerCase()}.jpg`, { type: "image/jpeg" });
      }

      if (!fileToSend) {
        throw new Error("Berkas gambar tidak ditemukan.");
      }

      const result = await runInspection(fileToSend, selectedFishType);
      onInspectionComplete?.(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melakukan inspeksi AI. Pastikan backend aktif.";
      setLocalError(msg);
      onError?.(msg);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 p-6 flex flex-col gap-4">
      {/* Hidden Canvas for Snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="size-5 text-sky-700" />
          <h2 className="text-lg font-bold font-sans text-zinc-900">
            Fish Inspection Viewfinder
          </h2>
        </div>

        {/* Source Navigation: Switches based on mockMode */}
        {mockMode ? (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
            <button
              type="button"
              onClick={() => startCamera("environment")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === "webcam"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-sky-700 hover:bg-slate-200"
              }`}
            >
              <Video className="size-3.5" />
              <span>Kamera Web</span>
            </button>
            <button
              type="button"
              onClick={handleUploadClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === "result" && !isCameraActive
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-sky-700 hover:bg-slate-200"
              }`}
            >
              <Upload className="size-3.5" />
              <span>Unggah Gambar</span>
            </button>
          </div>
        ) : (
          /* Hardware Mode Header: Edge Live Badge & Return Button */
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Button
                variant="outline-sky"
                size="sm"
                onClick={handleStartEdgeStream}
                className="text-xs bg-slate-900 text-sky-300 border-sky-500 hover:bg-slate-800"
              >
                <Tv className="size-3.5 mr-1 text-sky-400" />
                <span>Kembali ke Live Stream IoT</span>
              </Button>
            )}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-medium">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold">RPi 4 Camera Active</span>
            </div>
          </div>
        )}
      </div>
      {/* Error Alert Banner */}
      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between gap-2 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>{localError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-red-500 hover:text-red-700 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* JURY QUICK-TEST PRESET BAR (Active in Mock Mode) */}
      {mockMode && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="size-4 text-sky-600 animate-pulse" />
              <span className="text-xs font-bold font-sans text-slate-800 tracking-wide uppercase">
                Jury Quick-Test Presets (Simulasi Demo Cepat)
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              1-Klik Muat Data Terkalibrasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Preset 1: Grade A */}
            <button
              type="button"
              disabled={isLoading || loadingPreset !== null}
              onClick={() => handleLoadPreset("grade_a", "Tuna")}
              className="flex items-center gap-2 p-2 rounded-md bg-white border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer shadow-xs disabled:opacity-50"
            >
              <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                {loadingPreset === "grade_a" ? <Loader2 className="size-3.5 animate-spin" /> : "A"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-emerald-800 truncate">Grade A (Segar)</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">PASS</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Tuna Ekspor (Sinyal Hijau)</p>
              </div>
            </button>

            {/* Preset 2: Conditional AWS Bedrock */}
            <button
              type="button"
              disabled={isLoading || loadingPreset !== null}
              onClick={() => handleLoadPreset("conditional", "Mackarel")}
              className="flex items-center gap-2 p-2 rounded-md bg-white border-2 border-amber-400 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group cursor-pointer shadow-xs ring-2 ring-amber-100 disabled:opacity-50"
            >
              <div className="size-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                {loadingPreset === "conditional" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-600" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-900 truncate">AWS Bedrock Demo</span>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded">COND</span>
                </div>
                <p className="text-[10px] text-amber-700 font-medium truncate">Memicu Agentic AI Vision</p>
              </div>
            </button>

            {/* Preset 3: Grade C */}
            <button
              type="button"
              disabled={isLoading || loadingPreset !== null}
              onClick={() => handleLoadPreset("grade_c", "Nila")}
              className="flex items-center gap-2 p-2 rounded-md bg-white border border-rose-300 hover:border-rose-500 hover:bg-rose-50/50 transition-all text-left group cursor-pointer shadow-xs disabled:opacity-50"
            >
              <div className="size-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs">
                {loadingPreset === "grade_c" ? <Loader2 className="size-3.5 animate-spin" /> : "C"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-rose-800 truncate">Grade C (Reject)</span>
                  <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1 rounded">FAIL</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Nila Rusak (Sinyal Merah)</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area: IoT Stream, Webcam, Image Preview, or Idle State */}
      <div className="relative w-full h-[380px] bg-slate-900 rounded-md outline outline-1 outline-slate-300 overflow-hidden flex items-center justify-center">
        {/* CASE 1: Live IoT Edge Camera Stream */}
        {viewMode === "edge" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {isEdgeOnline ? (
              <img
                src={edgeStreamUrl}
                alt="IoT Edge Conveyor Live Stream"
                className="w-full h-full object-contain"
                onLoad={() => setIsEdgeOnline(true)}
                onError={() => {
                  if (useProxyStream) {
                    // Try direct stream if proxy had an issue
                    setUseProxyStream(false);
                  } else {
                    setIsEdgeOnline(false);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3 max-w-sm">
                <WifiOff className="size-10 text-amber-400 stroke-[1.5]" />
                <div>
                  <p className="font-semibold text-white text-sm">IoT Edge Stream Belum Terhubung</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pastikan Raspberry Pi 4 aktif di <span className="font-mono text-sky-300">{edgeHost}</span>
                  </p>
                </div>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline-sky"
                    size="sm"
                    onClick={() => {
                      setUseProxyStream(true);
                      setIsEdgeOnline(true);
                    }}
                  >
                    <RefreshCw className="size-3.5 mr-1" />
                    Coba Lagi
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => startCamera("environment")}
                    className="text-xs"
                  >
                    Gunakan Kamera Web
                  </Button>
                </div>
              </div>
            )}

            {/* Top-Left Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto z-10">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-black/75 backdrop-blur-xs rounded-full border border-white/20 text-white text-xs font-medium">
                <div
                  className={`size-2 rounded-full ${
                    isEdgeOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span className="font-mono text-[11px] tracking-wide">
                  {isEdgeOnline ? "LIVE EDGE (RPi 4)" : "EDGE OFFLINE"}
                </span>
                <span className="text-slate-400 text-[10px]">|</span>
                <span className="text-sky-300 font-mono text-[10px]">{edgeHost}</span>
              </div>
            </div>

            {/* Top-Right Settings & Close */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-auto z-10">
              <button
                type="button"
                onClick={() => setIsEditingEdgeHost(!isEditingEdgeHost)}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer border border-white/10"
                title="Konfigurasi IP Edge"
              >
                <Settings2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("idle")}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer border border-white/10"
                title="Tutup Stream"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Edge Host IP Config Popover */}
            {isEditingEdgeHost && (
              <div className="absolute top-14 right-3 z-30 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-white flex flex-col gap-2 w-72">
                <span className="font-semibold text-slate-200">Host IP Kamera RPi 4:</span>
                <input
                  type="text"
                  value={edgeInputHost}
                  onChange={(e) => setEdgeInputHost(e.target.value)}
                  placeholder="192.168.137.251:8080"
                  className="px-2.5 py-1.5 rounded bg-slate-800 border border-slate-600 text-white font-mono text-xs focus:outline-sky-400"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEdgeInputHost(edgeHost);
                      setIsEditingEdgeHost(false);
                    }}
                    className="px-2 py-1 text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEdgeHost(edgeInputHost.trim());
                      setIsEditingEdgeHost(false);
                      setIsEdgeOnline(true);
                    }}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Stream Action Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 pointer-events-auto z-10 px-4">
              <button
                type="button"
                onClick={handleCaptureEdgeSnapshotAndInspect}
                disabled={isCapturingEdge || !isEdgeOnline}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs font-sans rounded-full shadow-lg transition-all active:scale-95 cursor-pointer border-2 border-white/60"
              >
                {isCapturingEdge ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-white" />
                    <span>Mengambil Frame & Menilai...</span>
                  </>
                ) : (
                  <>
                    <Camera className="size-4 text-white" />
                    <span>Ambil Snapshot & Jalankan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : viewMode === "webcam" && isCameraActive ? (
          /* CASE 2: Local WebRTC Camera Feed */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                  el.srcObject = mediaStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Top Controls: Flip & Close */}
            <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto z-10">
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                title="Ganti Kamera"
              >
                <FlipHorizontal className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setViewMode("idle");
                }}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                title="Tutup Kamera"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Bottom Capture Button Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 pointer-events-auto z-10">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm font-sans rounded-full shadow-lg transition-all active:scale-95 cursor-pointer border-2 border-white"
              >
                <Camera className="size-4.5 text-white" />
                <span>Ambil Foto</span>
              </button>
            </div>
          </div>
        ) : previewUrl ? (
          /* CASE 3: Result Snapshot Image with Bounding Box Overlay */
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <img
              src={previewUrl}
              alt="Hasil inspeksi ikan"
              onLoad={handleImageLoaded}
              className="w-full h-full object-contain"
            />

            {/* Top Bar for Result View: Return to Live Stream / Retake */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
              <div className="px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded-full border border-white/20 text-white text-xs font-mono">
                {lastResult?.lotId ? `Snapshot: ${lastResult.lotId}` : "Snapshot QC"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline-sky"
                  size="sm"
                  onClick={handleStartEdgeStream}
                  className="text-xs bg-slate-900/90 text-sky-300 border-sky-500 hover:bg-slate-800"
                >
                  <Tv className="size-3.5 mr-1 text-sky-400" />
                  <span>Live Stream IoT</span>
                </Button>
                <Button
                  variant="outline-sky"
                  size="sm"
                  onClick={handleResetToIdle}
                  className="text-xs bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>

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
          /* CASE 4: Idle State - Used in Mock Mode */
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md flex flex-col items-center gap-4">
              <div>
                <p className="text-base font-bold font-sans text-zinc-900">
                  Ambil Snapshot Kamera atau Unggah Sampel
                </p>
                <p className="text-xs font-normal font-sans text-gray-500 mt-1">
                  Pilih metode pengambilan citra ikan untuk proses klasifikasi kesegaran dan deteksi cacat mutu.
                </p>
              </div>

              {/* Action Buttons Grid: 2 buttons for mock mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
                {/* 1. Local Laptop Webcam */}
                <button
                  type="button"
                  onClick={() => startCamera("environment")}
                  disabled={isCameraLoading}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-sky-50 border-2 border-sky-300 hover:border-sky-500 hover:bg-sky-100 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="size-11 rounded-full bg-sky-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    {isCameraLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Video className="size-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-sky-900 block">
                      Akses Kamera Feed
                    </span>
                    <span className="text-[10px] font-sans text-sky-700 block mt-0.5">
                      Buka Web Camera & Ambil Foto
                    </span>
                  </div>
                </button>

                {/* 2. File Upload Button */}
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="size-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-zinc-900 block">
                      Unggah Berkas Gambar
                    </span>
                    <span className="text-[10px] font-sans text-gray-500 block mt-0.5">
                      Pilih file JPEG/PNG/WEBP
                    </span>
                  </div>
                </button>
              </div>
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

      {/* Controls Row: Fish Type Selector */}
      <div className="flex items-end gap-4 pt-2 border-t border-slate-100">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs font-bold font-sans text-gray-700 tracking-wide">
            Jenis Ikan (Fish Type Category)
          </label>
          <select
            value={selectedFishType}
            onChange={(e) => setSelectedFishType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 text-sm font-sans font-medium text-zinc-900 cursor-pointer focus:outline-sky-500"
          >
            {FISH_TYPES.map((f) => (
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

      {/* AI Governance Disclaimer */}
      <p className="text-[11px] text-gray-400 font-sans text-center italic">
        AI adalah sistem pendukung keputusan QC, bukan pengganti mutlak penilaian akhir operator manusia.
      </p>
    </div>
  );
};
