"use client";

import React from "react";
import { Search, ChevronDown, Download } from "lucide-react";

const FISH_FAMILIES = [
  { value: "all", label: "All Fish Families" },
  { value: "Scombridae", label: "Scombridae" },
  { value: "Cichlidae", label: "Cichlidae" },
  { value: "Salmonidae", label: "Salmonidae" },
  // TODO: Replace options dynamically from GET /api/v1/fish-families
];

const GRADES = [
  { value: "all", label: "All Grades" },
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
];

const DECISIONS = [
  { value: "all", label: "All Decisions" },
  { value: "PASS", label: "PASS" },
  { value: "FAIL", label: "FAIL" },
];

type SearchHistoryProps = {
  search: string;
  onSearchChange: (val: string) => void;
  fishFamily: string;
  onFishFamilyChange: (val: string) => void;
  grade: string;
  onGradeChange: (val: string) => void;
  decision: string;
  onDecisionChange: (val: string) => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  onClearFilters: () => void;
};

export const SearchHistory = ({
  search,
  onSearchChange,
  fishFamily,
  onFishFamilyChange,
  grade,
  onGradeChange,
  decision,
  onDecisionChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}: SearchHistoryProps) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Page Title & Subtitle */}
      <div className="w-full flex flex-col">
        <h1 className="text-2xl font-bold font-sans text-zinc-900">
          Inspection History
        </h1>
        <p className="text-sm font-sans text-gray-500">
          All inspection records from this session
        </p>
      </div>

      {/* Search & Filter Card */}
      <div className="w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 p-6 flex flex-col gap-4">
        {/* Row 1: Search Input & Dropdowns */}
        <div className="flex items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Lot ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 text-sm font-sans text-zinc-900 placeholder:text-gray-500 focus:outline-sky-500"
            />
          </div>

          {/* Fish Family Filter */}
          <div className="relative">
            <select
              value={fishFamily}
              onChange={(e) => onFishFamilyChange(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 appearance-none pr-9 text-sm font-sans text-zinc-900 cursor-pointer focus:outline-sky-500"
            >
              {FISH_FAMILIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Grade Filter */}
          <div className="relative">
            <select
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 appearance-none pr-9 text-sm font-sans text-zinc-900 cursor-pointer focus:outline-sky-500"
            >
              {GRADES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Decision Filter */}
          <div className="relative">
            <select
              value={decision}
              onChange={(e) => onDecisionChange(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 appearance-none pr-9 text-sm font-sans text-zinc-900 cursor-pointer focus:outline-sky-500"
            >
              {DECISIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Date Range & Actions */}
        <div className="flex items-center gap-3 w-full">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-sm outline outline-1 outline-slate-300 px-3 py-1.5 text-sm font-sans">
            <span className="text-gray-700">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="bg-transparent border-none text-sm font-mono text-zinc-900 focus:outline-none cursor-pointer"
            />
            <span className="text-gray-700 ml-2">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="bg-transparent border-none text-sm font-mono text-zinc-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={onClearFilters}
              className="text-sm font-medium font-sans text-sky-700 hover:underline cursor-pointer"
            >
              Clear Filters
            </button>

            <button
              onClick={() => {
                // TODO: Implement CSV export call to GET /api/v1/lots/export?format=csv
                console.log("Export CSV clicked");
              }}
              className="flex items-center gap-2 px-4 py-2 outline outline-1 outline-sky-700 rounded-sm text-sky-700 text-sm font-medium font-sans hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Download className="size-4 text-sky-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

