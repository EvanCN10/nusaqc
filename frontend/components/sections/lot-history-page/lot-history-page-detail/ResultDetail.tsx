"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Info,
  Clock,
  Radio,
  AlertTriangle,
  X,
  Check,
  Loader2,
  Inbox,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { fetchLotById } from "@/lib/api";
import { LotRecord, Defect } from "@/types";
import { TowerLight } from "@/components/common/TowerLight";

const DEFECT_COLOR_MAP: Record<string, { border: string; bg: string; text: string; label: string }> = {
  sisik_sisa: { border: "border-amber-500", bg: "bg-amber-600", text: "text-white", label: "Sisik Sisa / Parasit" },
  warna_abnormal: { border: "border-red-600", bg: "bg-red-600", text: "text-white", label: "Warna Abnormal / BDA/BRD" },
  luka_robekan: { border: "border-yellow-500", bg: "bg-yellow-600", text: "text-white", label: "Luka Robekan / Ulcer" },
  lendir_berlebih: { border: "border-purple-600", bg: "bg-purple-600", text: "text-white", label: "Lendir Berlebih / WTD" },
};

const gradeColorMap: Record<string, { bg: string; text: string; border: string; ring: string; progress: string; desc: string }> = {
  A: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-500",
    ring: "outline-green-500/30",
    progress: "bg-green-600",
    desc: "Kualitas Prima — Standar Mutu Ekspor (SNI 2729:2013)",
  },
  B: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-500",
    ring: "outline-amber-500/30",
    progress: "bg-amber-500",
    desc: "Kualitas Baik — Standar Pasar Domestik (SNI 2729:2013)",
  },
  C: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-500",
    ring: "outline-red-500/30",
    progress: "bg-red-600",
    desc: "Kualitas Rendah / Busuk — Rekomendasi Reject (SNI 2729:2013)",
  },
};

type ResultDetailProps = {
  lotId: string;
};

export const ResultDetail = ({ lotId }: ResultDetailProps) => {
  const [lot, setLot] = useState<LotRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageDimensions, setImageDimensions] = useState<{ naturalWidth: number; naturalHeight: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLotById(lotId);
        if (isMounted) setLot(data);
      } catch (err) {
        console.warn("Failed to fetch lot details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [lotId]);

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      naturalWidth: img.naturalWidth || 640,
      naturalHeight: img.naturalHeight || 480,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-xs outline outline-1 outline-slate-300 p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-sky-600" />
        <p className="text-sm font-semibold font-sans text-zinc-800">Memuat Detail Lot {lotId}...</p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="w-full bg-white rounded-lg shadow-xs outline outline-1 outline-slate-300 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Inbox className="size-10 text-slate-300" />
        <div>
          <h2 className="text-lg font-bold font-sans text-zinc-900">Catatan Lot Tidak Ditemukan</h2>
          <p className="text-xs font-sans text-gray-500 mt-1">
            Lot ID &quot;{lotId}&quot; tidak tersimpan di database audit inspeksi.
          </p>
        </div>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 text-white text-xs font-bold font-sans rounded-sm hover:bg-sky-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Daftar Riwayat</span>
        </Link>
      </div>
    );
  }

  const decision = (lot.decision || "PASS").toUpperCase();
  const isPass = decision === "PASS";
  const isConditional = decision === "CONDITIONAL";
  const isFail = decision === "FAIL";

  const gradeKey = lot.grade || "A";
  const gradeStyle = gradeColorMap[gradeKey] || gradeColorMap.A;
  const confidenceVal = Math.round(
    lot.confidence !== undefined
      ? lot.confidence > 1.0 ? lot.confidence : lot.confidence * 100
      : (lot.grade_confidence ? lot.grade_confidence * 100 : 90)
  );

  const rawSignal = lot.conveyorSignal || lot.hardware_signal || (isFail ? "RED" : "GREEN");
  const defectsList: Defect[] = lot.defects || [];

  // Format full date
  let formattedDate = lot.timestamp;
  let formattedTime = "";
  try {
    const d = new Date(lot.timestamp);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
      formattedTime = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  } catch {
    // fallback
  }

  // Construct absolute or backend URL for image
  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
  const imgSrc = lot.imageUrl
    ? lot.imageUrl.startsWith("http") ? lot.imageUrl : `${backendBase}${lot.imageUrl}`
    : lot.image_path
    ? lot.image_path.startsWith("http") ? lot.image_path : `${backendBase}${lot.image_path}`
    : "";

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Image & Model Info (col-span-7) */}
      <div className="xl:col-span-7 w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 flex flex-col overflow-hidden">
        {/* Scanned Image with YOLOv8 Bounding Boxes */}
        <div className="relative bg-slate-900 flex justify-center items-center min-h-[380px] max-h-[460px] overflow-hidden">
          {imgSrc ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imgSrc}
                alt={`Scan of ${lotId}`}
                onLoad={handleImageLoaded}
                className="w-full h-full max-h-[440px] object-contain"
              />

              {/* Dynamic Defect Bounding Boxes */}
              {defectsList.length > 0 && imageDimensions && (
                <div className="absolute inset-0 pointer-events-none">
                  {defectsList.map((defect, idx) => {
                    const [x1, y1, x2, y2] = defect.bbox || [0, 0, 0, 0];
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
                        className={`absolute border-2 ${styleInfo.border} rounded-xs`}
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
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 p-12">
              <Inbox className="size-10" />
              <span className="text-xs font-mono">Snapshot citra tidak tersedia</span>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-zinc-900 flex flex-wrap justify-between items-center text-xs font-mono text-gray-200 border-t border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-sky-400" />
            <span>Latency: {lot.processingTimeMs || lot.processing_time_ms || 120}ms</span>
          </div>
          <div className="text-slate-400">
            Model: MobileNetV3-Small (Freshness) + YOLOv8s (Defects)
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Decision, Metadata, Freshness & Defects (col-span-5) */}
      <div className="xl:col-span-5 w-full flex flex-col gap-4">
        {/* 1. Decision Banner */}
        <div
          className={`w-full px-6 py-4 rounded-lg shadow-xs border flex items-center justify-between ${
            isPass
              ? "bg-green-50 text-green-800 border-green-300"
              : isConditional
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {isPass && <Check className="size-8 text-green-700 stroke-[3]" />}
            {isConditional && <AlertTriangle className="size-8 text-amber-700 stroke-[2.5]" />}
            {isFail && <X className="size-8 text-red-700 stroke-[3]" />}
            <div>
              <span className="text-2xl font-black font-sans tracking-wide leading-tight block">
                {isPass ? "PASS" : isConditional ? "CONDITIONAL" : "FAIL"}
              </span>
              <span className="text-xs font-sans opacity-80">
                {isPass ? "Lolos Standar Mutu Ekspor" : isConditional ? "Perlu Verifikasi Manual" : "Tolak / Reject"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold font-mono block text-gray-500">LOT ID</span>
            <span className="text-sm font-bold font-mono text-zinc-900">{lot.lotId || lot.lot_id}</span>
          </div>
        </div>

        {/* 2. Metadata Card */}
        <div className="p-5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-sm border border-slate-100">
              <span className="font-semibold text-gray-500 uppercase tracking-wider block">Jenis Ikan</span>
              <span className="font-sans font-bold text-zinc-900 mt-0.5 block">{lot.fishFamily || lot.fish_family || "Tuna"}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-sm border border-slate-100">
              <span className="font-semibold text-gray-500 uppercase tracking-wider block">Waktu Inspeksi</span>
              <span className="font-mono font-bold text-zinc-900 mt-0.5 block">{formattedTime || lot.timestamp}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-sm border border-slate-100">
              <span className="font-semibold text-gray-500 uppercase tracking-wider block">Tanggal</span>
              <span className="font-sans font-bold text-zinc-900 mt-0.5 block">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* 3. Freshness Grade Card */}
        <div
          className={`p-5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 ${gradeStyle.border} border-t border-r border-b border-slate-200 flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-sky-700" />
              <h3 className="text-sm font-bold font-sans text-zinc-900">Freshness Grade (Model 1)</h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm border border-sky-200">
              SNI 2729:2013
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`size-14 shrink-0 ${gradeStyle.bg} rounded-full outline outline-2 outline-offset-[-2px] ${gradeStyle.ring} flex flex-col justify-center items-center shadow-xs`}
            >
              <span className={`text-2xl font-black font-sans leading-none ${gradeStyle.text}`}>
                {lot.grade}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-600 font-medium">Confidence Score</span>
                <span className="font-bold text-zinc-900">{confidenceVal}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full ${gradeStyle.progress} rounded-full`}
                  style={{ width: `${confidenceVal}%` }}
                />
              </div>
              <p className="text-xs font-sans text-gray-500 pt-0.5">{gradeStyle.desc}</p>
            </div>
          </div>
        </div>

        {/* 4. Defect Detection Card */}
        <div className="p-5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 border-rose-500 border-t border-r border-b border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold font-sans text-zinc-900">
              Defect Detection (Model 2 YOLOv8s)
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded-sm text-gray-700">
              {defectsList.length} Defek
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {defectsList.length > 0 ? (
              defectsList.map((defect, index) => {
                const bStyle = DEFECT_COLOR_MAP[defect.label] || {
                  bg: "bg-red-50",
                  text: "text-red-800",
                  border: "border-red-300",
                };
                const defConf = Math.round(
                  defect.confidence > 1.0 ? defect.confidence : defect.confidence * 100
                );

                return (
                  <div
                    key={`${defect.label}-${index}`}
                    className={`px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 flex items-center gap-1.5 text-xs font-mono text-zinc-900`}
                  >
                    <span className="font-bold">{defect.label}</span>
                    <span className="text-gray-500 font-semibold">({defConf}%)</span>
                  </div>
                );
              })
            ) : (
              <div className="p-2.5 w-full bg-emerald-50 border border-emerald-200 rounded-md text-xs font-sans text-emerald-800 flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                <span>Tidak ada cacat atau penyakit permukaan terdeteksi (Clean).</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Conveyor Actuator Signal */}
        <div className="p-4 bg-white rounded-lg shadow-xs outline outline-1 outline-slate-300 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold font-sans uppercase tracking-wider text-gray-500">
              Conveyor Actuator Status
            </span>
            <span className="text-sm font-bold font-sans text-zinc-900">
              {rawSignal === "GREEN" && "Conveyor Running (Lolos Sortir)"}
              {rawSignal === "YELLOW" && "Conveyor Slow (Verifikasi Manual)"}
              {rawSignal === "RED" && "Conveyor Reject / Ejector Aktif"}
            </span>
          </div>
          <TowerLight signal={rawSignal as "GREEN" | "YELLOW" | "RED"} />
        </div>
      </div>
    </div>
  );
};
