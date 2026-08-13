import React from "react";
import { Check, X } from "lucide-react";
import { TowerLight } from "@/components/common/TowerLight";

type InspectionResult = {
  decision: "PASS" | "FAIL";
  lotId: string;
  grade: "A" | "B" | "C";
  confidence: number;
  freshnessNote: string;
  defects: { label: string; confidence: number }[];
  conveyorSignal: "GREEN" | "RED";
};

// TODO: Replace with actual API response from POST /api/v1/inspections/run
// Expected response body matches InspectionResult shape
const MOCK_RESULT: InspectionResult = {
  decision: "PASS",
  lotId: "LOT-2026-0730-006",
  grade: "A",
  confidence: 91.2,
  freshnessNote: "Mata jernih, sisik menempel kuat, tidak ada bau menyimpang",
  defects: [
    { label: "sisik_sisa", confidence: 87 },
    { label: "mata_keruh", confidence: 61 },
  ],
  conveyorSignal: "GREEN",
};

const decisionConfig = {
  PASS: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "outline-green-600/20",
    icon: <Check className="size-6 text-green-600 stroke-4" />,
  },
  FAIL: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "outline-red-500/20",
    icon: <X className="size-6 text-red-600 stroke-4"/>,
  },
};

const gradeColorMap = {
  A: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-emerald-500",
    ring: "outline-green-600/20",
    progress: "bg-emerald-500",
  },
  B: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-500",
    ring: "outline-amber-600/20",
    progress: "bg-amber-500",
  },
  C: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-500",
    ring: "outline-red-500/20",
    progress: "bg-red-500",
  },
};

export const ResultSection = () => {
  const result = MOCK_RESULT;
  const decisionStyle = decisionConfig[result.decision];
  const gradeStyle = gradeColorMap[result.grade];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Decision Banner (PASS / FAIL) */}
      <div
        className={`w-full px-8 py-4 ${decisionStyle.bg} rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] ${decisionStyle.border} flex flex-col justify-center items-center gap-1`}
      >
        <div className="flex items-center gap-2">
          {decisionStyle.icon}
          <span
            className={`text-3xl font-bold font-sans leading-none ${decisionStyle.text}`}
          >
            {result.decision}
          </span>
        </div>
        <span
          className={`text-xs font-mono font-medium tracking-wide ${decisionStyle.text} opacity-75`}
        >
          {result.lotId}
        </span>
      </div>

      {/* 2. Freshness Grade Card */}
      <div
        className={`w-full p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 ${gradeStyle.border} border flex flex-col gap-4`}
      >
        <h3 className="text-xl font-bold font-sans text-zinc-900">
          Freshness Grade
        </h3>

        <div className="flex items-center gap-4">
          {/* Grade Badge Circle */}
          <div
            className={`size-16 shrink-0 ${gradeStyle.bg} rounded-full outline outline-2 outline-offset-[-2px] ${gradeStyle.ring} flex justify-center items-center`}
          >
            <span className={`text-3xl font-bold font-sans ${gradeStyle.text}`}>
              {result.grade}
            </span>
          </div>

          {/* Confidence & Note */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-700 font-medium">Confidence</span>
              {/* TODO: AI model confidence score */}
              <span className="text-zinc-900 font-semibold">
                {result.confidence}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-2 ${gradeStyle.progress} rounded-full transition-all duration-500`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>

            {/* Note */}
            <p className="pt-1 text-xs text-gray-600 italic font-sans leading-relaxed">
              &quot;{result.freshnessNote}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* 3. Defect Detection Card */}
      <div className="w-full p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-l-4 border-red-500 border flex flex-col gap-4">
        <h3 className="text-xl font-bold font-sans text-zinc-900">
          Defect Detection
        </h3>

        {/* TODO: AI YOLOv8 defect bounding box / detection labels */}
        <div className="flex flex-wrap gap-2">
          {result.defects.length > 0 ? (
            result.defects.map((defect, index) => (
              <div
                key={defect.label}
                className={`px-3 py-1 rounded-full outline outline-1 outline-offset-[-1px] flex items-center gap-1 text-xs font-mono ${
                  index === 0
                    ? "bg-red-100 text-red-800 outline-red-200 font-medium"
                    : "bg-zinc-200 text-gray-700 outline-slate-300 font-medium"
                }`}
              >
                <span>{defect.label}</span>
                <span className="opacity-75 font-semibold">
                  ({defect.confidence}%)
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs font-sans text-gray-500">
              Tidak ada defek terdeteksi
            </span>
          )}
        </div>
      </div>

      {/* 4. Conveyor Signal Card */}
      <div className="w-full px-6 py-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300 flex flex-col justify-center items-center gap-3">
        {/* TODO: GPIO Relay / Conveyor Signal status from backend */}
        <TowerLight signal={result.conveyorSignal} />
        <span className="text-xs font-semibold font-sans uppercase tracking-wide text-gray-700">
          CONVEYOR SIGNAL
        </span>
      </div>
    </div>
  );
};
