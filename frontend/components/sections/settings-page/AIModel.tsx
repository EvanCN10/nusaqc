"use client";

import React from "react";
import { Brain, Check } from "lucide-react";

type AIModelProps = {
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  activeSpecies: string[];
  onSpeciesChange: (val: string[]) => void;
};

const SPECIES_OPTIONS = [
  { id: "Scombridae", label: "Scombridae (Tuna/Mackerel)" },
  { id: "Cichlidae", label: "Cichlidae (Tilapia)" },
  { id: "Salmonidae", label: "Salmonidae (Salmon/Trout)" },
];

export const AIModel = ({
  confidenceThreshold,
  onConfidenceChange,
  activeSpecies,
  onSpeciesChange,
}: AIModelProps) => {
  const toggleSpecies = (id: string) => {
    if (activeSpecies.includes(id)) {
      onSpeciesChange(activeSpecies.filter((item) => item !== id));
    } else {
      onSpeciesChange([...activeSpecies, id]);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300/50 flex flex-col gap-6">
      {/* Section Header */}
      <div className="w-full pb-4 border-b border-slate-300/30 flex items-center gap-2">
        <Brain className="size-5 text-sky-700" />
        <h2 className="text-xl font-semibold font-sans text-zinc-900">
          AI Model Configuration
        </h2>
      </div>

      {/* Model Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Freshness Classifier */}
        <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-r border-t border-b border-sky-500 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold font-sans text-zinc-900">
              Freshness Classifier
            </span>
            {/* TODO: Dynamically display model loaded status from GET /api/v1/models/status */}
            <div className="px-2 py-0.5 bg-green-100 rounded-sm outline outline-1 outline-green-200 flex items-center gap-1">
              <div className="size-2 bg-green-800 rounded-full" />
              <span className="text-xs font-semibold font-sans tracking-wide text-green-800">
                Loaded
              </span>
            </div>
          </div>
          <span className="text-sm font-medium font-mono text-gray-700">
            MobileNetV3-Small ONNX v1.2.0
          </span>
        </div>

        {/* Card 2: Defect Detector */}
        <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-r border-t border-b border-sky-500 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold font-sans text-zinc-900">
              Defect Detector
            </span>
            <div className="px-2 py-0.5 bg-green-100 rounded-sm outline outline-1 outline-green-200 flex items-center gap-1">
              <div className="size-2 bg-green-800 rounded-full" />
              <span className="text-xs font-semibold font-sans tracking-wide text-green-800">
                Loaded
              </span>
            </div>
          </div>
          <span className="text-sm font-medium font-mono text-gray-700">
            YOLOv8n ONNX v1.1.0
          </span>
        </div>
      </div>

      {/* Confidence Threshold (FAIL) */}
      <div className="pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold font-sans text-zinc-900">
            Confidence Threshold (FAIL)
          </span>
          <div className="px-2 py-0.5 bg-rose-200/30 rounded-sm">
            <span className="text-sm font-bold font-mono text-red-700">
              {confidenceThreshold}%
            </span>
          </div>
        </div>

        {/* Custom Input Range Slider */}
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceThreshold}
            onChange={(e) => onConfidenceChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-700"
          />
        </div>

        <div className="flex justify-between items-center text-xs font-mono text-gray-700">
          <span>More strict (Higher False Positives)</span>
          <span>More lenient (Higher False Negatives)</span>
        </div>
      </div>

      {/* Target Species Filter (Active Models) */}
      <div className="pt-4 border-t border-slate-300/30 flex flex-col gap-3">
        <span className="text-sm font-bold font-sans text-zinc-900">
          Target Species Filter (Active Models)
        </span>

        <div className="flex flex-wrap gap-4">
          {SPECIES_OPTIONS.map((opt) => {
            const isActive = activeSpecies.includes(opt.id);
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => toggleSpecies(opt.id)}
                className={`pl-2.5 pr-3 py-2 rounded-md shadow-sm outline outline-1 outline-offset-[-1px] flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? "bg-white outline-sky-500 text-zinc-900"
                    : "bg-gray-100 opacity-70 outline-slate-300/50 text-gray-700"
                }`}
              >
                <div
                  className={`size-4 rounded-sm flex items-center justify-center transition-colors ${
                    isActive ? "bg-sky-500" : "bg-white border border-slate-300"
                  }`}
                >
                  {isActive && <Check className="size-3 text-white stroke-[3]" />}
                </div>
                <span className="text-base font-normal font-sans">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

