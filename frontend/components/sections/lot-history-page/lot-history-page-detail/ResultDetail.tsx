"use client";

import React from "react";
import {
  RotateCcw,
  Edit3,
  Download,
  Info,
  FileText,
  Radio,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { MOCK_LOTS } from "@/lib/mockData";

type LotDetailData = {
  lotId: string;
  decision: "PASS" | "FAIL";
  timestamp: string;
  date: string;
  fishFamily: string;
  inspectorNote: string;
  imageUrl: string;
  processingTimeMs: number;
  grade: "A" | "B" | "C";
  overallConfidence: number;
  eyeClarity: "Good" | "Fair" | "Poor";
  scaleCondition: "Good" | "Fair" | "Poor";
  defects: { label: string; confidence: number }[];
  hardwareSignal: "GREEN" | "RED";
};

// TODO: Replace mock data with GET /api/v1/lots/{lotId} API response
const MOCK_DETAIL: LotDetailData = {
  lotId: "LOT-2026-0730-003",
  decision: "FAIL",
  timestamp: "10:24:50",
  date: "2026-07-30",
  fishFamily: "Scombridae",
  inspectorNote: "Batch dari cold storage lot #C-22",
  imageUrl: "https://placehold.co/482x362/e2e8f0/334155?text=Fish+Inspection+Scan",
  processingTimeMs: 245,
  grade: "C",
  overallConfidence: 61.2,
  eyeClarity: "Poor",
  scaleCondition: "Fair",
  defects: [
    { label: "sisik_sisa", confidence: 87 },
    { label: "mata_keruh", confidence: 61 },
  ],
  hardwareSignal: "RED",
};

const clarityStyleMap = {
  Good: { dot: "bg-green-600", text: "text-green-600" },
  Fair: { dot: "bg-amber-600", text: "text-amber-600" },
  Poor: { dot: "bg-red-600", text: "text-red-600" },
};

const gradeStyleMap = {
  A: { bg: "bg-green-100", text: "text-green-600", border: "border-emerald-500", progress: "bg-emerald-500" },
  B: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-500", progress: "bg-amber-500" },
  C: { bg: "bg-red-100", text: "text-red-600", border: "border-red-700/50", progress: "bg-red-700" },
};

type ResultDetailProps = {
  lotId: string;
};

export const ResultDetail = ({ lotId }: ResultDetailProps) => {
  const tableData = MOCK_LOTS.find((lot) => lot.lotId === lotId);

  const data: LotDetailData = {
    ...MOCK_DETAIL,
    lotId,
    timestamp: tableData?.timestamp || MOCK_DETAIL.timestamp,
    fishFamily: tableData?.fishFamily || MOCK_DETAIL.fishFamily,
    grade: tableData?.grade || MOCK_DETAIL.grade,
    decision: tableData?.decision || MOCK_DETAIL.decision,
    overallConfidence: tableData?.confidence || MOCK_DETAIL.overallConfidence,
    hardwareSignal: tableData?.decision === "FAIL" ? "RED" : "GREEN",
  };
  const gradeStyle = gradeStyleMap[data.grade];
  const isFail = data.decision === "FAIL";

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      {/* LEFT COLUMN: Image & Model Info */}
      <div className="w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 flex flex-col overflow-hidden">
        {/* Image Area with Bounding Boxes */}
        <div className="relative bg-gray-100 flex justify-center items-center min-h-[340px]">
          {/* TODO: Replace placeholder image with scanned image URL from API response */}
          <img
            src={data.imageUrl}
            alt={`Scan of ${data.lotId}`}
            className="w-full h-auto object-cover"
          />

          {/* TODO: Render bounding boxes dynamically from YOLOv8n API detection output */}
          {/* Mock Bounding Box 1: sisik_sisa */}
          <div className="absolute top-[20%] left-[30%] w-[80px] h-[90px] outline outline-2 outline-red-700 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-red-700 text-white text-[11px] font-mono px-2 py-0.5 shadow-sm whitespace-nowrap">
              sisik_sisa 87%
            </div>
          </div>

          {/* Mock Bounding Box 2: mata_keruh */}
          <div className="absolute top-[15%] right-[20%] w-[50px] h-[55px] outline outline-2 outline-red-700 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-red-700 text-white text-[11px] font-mono px-2 py-0.5 shadow-sm whitespace-nowrap">
              mata_keruh 61%
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-zinc-800 flex justify-between items-center text-xs font-mono text-gray-100">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-sky-300" />
            {/* TODO: AI inference latency from API */}
            <span>Processed in {data.processingTimeMs}ms</span>
          </div>
          <div className="text-slate-300">
            {/* TODO: Model versions metadata from API */}
            Model: YOLOv8n-defect + MobileNetV3-freshness
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Decision, Metadata, Analysis, Hardware Signal & Actions */}
      <div className="w-full flex flex-col gap-4">
        {/* 1. Decision Badge */}
        <div className="flex justify-center">
          <div
            className={`px-8 py-3 rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] flex items-center gap-2 ${
              isFail
                ? "bg-red-100 text-red-600 outline-red-600/20"
                : "bg-green-100 text-green-600 outline-green-600/20"
            }`}
          >
            {isFail ? (
              <X className="size-7 text-red-600 stroke-4" />
            ) : (
              <Check className="size-7 text-green-600 stroke-4" />
            )}
            <span className="text-3xl font-bold font-sans">
              {data.decision}
            </span>
          </div>
        </div>

        {/* 2. Metadata Card */}
        <div className="p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Timestamp */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 font-sans">
                Timestamp
              </span>
              <span className="text-sm font-medium font-mono text-zinc-900">
                Inspected at {data.timestamp} on {data.date}
              </span>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 font-sans">
                Subject
              </span>
              <span className="text-sm font-medium font-sans text-zinc-900">
                Family: {data.fishFamily}
              </span>
            </div>
          </div>

          {/* Inspector Note */}
          <div className="pt-3 border-t border-slate-300/40 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 font-sans">
              <FileText className="size-3.5 text-gray-700" />
              <span>Inspector Note</span>
            </div>
            <div className="p-2.5 bg-gray-100 outline outline-1 outline-slate-300/50 rounded-sm text-sm font-sans text-zinc-900">
              &quot;{data.inspectorNote}&quot;
            </div>
          </div>
        </div>

        {/* 3. Freshness & Defects Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Freshness Analysis Card */}
          <div
            className={`p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 ${gradeStyle.border} border-r border-t border-b border-slate-200 flex flex-col gap-4`}
          >
            <h3 className="text-xl font-bold font-sans text-zinc-900 pb-2 border-b border-slate-300/30">
              Freshness Analysis
            </h3>

            <div className="flex items-center gap-4">
              {/* Grade Circle */}
              <div
                className={`size-14 shrink-0 ${gradeStyle.bg} rounded-full flex justify-center items-center`}
              >
                <span className={`text-3xl font-bold font-sans ${gradeStyle.text}`}>
                  {data.grade}
                </span>
              </div>

              {/* Confidence Bar */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-700 font-normal">
                    Overall Confidence
                  </span>
                  <span className={`font-semibold ${gradeStyle.text}`}>
                    {data.overallConfidence}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${gradeStyle.progress} rounded-full`}
                    style={{ width: `${data.overallConfidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Clarity Details */}
            <div className="pt-2 flex flex-col gap-2 text-sm font-sans">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Eye clarity</span>
                <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full ${clarityStyleMap[data.eyeClarity].dot}`} />
                  <span className={`font-medium ${clarityStyleMap[data.eyeClarity].text}`}>
                    {data.eyeClarity}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Scale condition</span>
                <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full ${clarityStyleMap[data.scaleCondition].dot}`} />
                  <span className={`font-medium ${clarityStyleMap[data.scaleCondition].text}`}>
                    {data.scaleCondition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Defects Card */}
          <div
            className={`p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 ${
              data.defects.length > 0 ? "border-red-700/50" : "border-emerald-500"
            } border-r border-t border-b border-slate-200 flex flex-col gap-4`}
          >
            <h3 className="text-xl font-bold font-sans text-zinc-900 pb-2 border-b border-slate-300/30">
              Detected Defects ({data.defects.length})
            </h3>

            <div className="flex flex-col gap-4">
              {data.defects.length > 0 ? (
                data.defects.map((defect, idx) => (
                  <div key={defect.label} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`size-4 ${
                            idx === 0 ? "text-red-700" : "text-amber-500"
                          }`}
                        />
                        <span
                          className={`font-medium font-sans ${
                            idx === 0 ? "text-zinc-900 font-bold" : "text-zinc-900"
                          }`}
                        >
                          {defect.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          idx === 0 ? "text-red-700" : "text-amber-600"
                        }`}
                      >
                        {defect.confidence}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          idx === 0 ? "bg-red-700" : "bg-amber-500"
                        }`}
                        style={{ width: `${defect.confidence}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-sm font-sans text-gray-500">
                  Tidak ada defek terdeteksi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Hardware Signal Card */}
        <div className="p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 flex items-center gap-3">
          <Radio className="size-5 text-red-700 shrink-0" />
          <div className="text-sm font-mono leading-relaxed">
            {/* TODO: GPIO Relay status from backend */}
            <span className="text-gray-700">Hardware Signal Sent: </span>
            <span className="text-red-600 font-bold">
              ● RED — Conveyor REJECT signal activated
            </span>
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="pt-4 border-t border-slate-300 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              // TODO: Trigger re-inspection API call or navigation to /inspection
              console.log("Re-inspect clicked for", data.lotId);
            }}
            className="px-4 py-2 bg-sky-500 text-white rounded-sm text-sm font-medium font-sans flex items-center gap-2 hover:bg-sky-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Re-inspect This Lot</span>
          </button>

          <button
            onClick={() => {
              // TODO: Trigger override decision modal or POST /api/v1/lots/{lotId}/override
              console.log("Override decision clicked for", data.lotId);
            }}
            className="px-4 py-2 bg-white outline outline-1 outline-red-700 rounded-sm text-red-700 text-sm font-medium font-sans flex items-center gap-2 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Edit3 className="size-4 text-red-700" />
            <span>Override Decision</span>
          </button>

          <button
            onClick={() => {
              // TODO: Export record API call GET /api/v1/lots/{lotId}/export
              console.log("Export record clicked for", data.lotId);
            }}
            className="ml-auto px-4 py-2 bg-white outline outline-1 outline-gray-500 rounded-sm text-gray-700 text-sm font-medium font-sans flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="size-4 text-gray-700" />
            <span>Export This Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

