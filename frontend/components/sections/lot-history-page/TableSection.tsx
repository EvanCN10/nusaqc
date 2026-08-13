"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { LotRecord, MOCK_LOTS } from "@/lib/mockData";

const GRADE_CONFIG: Record<LotRecord["grade"], { bg: string; text: string }> = {
  A: { bg: "bg-green-100", text: "text-green-600" },
  B: { bg: "bg-amber-100", text: "text-amber-600" },
  C: { bg: "bg-red-100",   text: "text-red-600"   },
};

const DECISION_CONFIG: Record<LotRecord["decision"], { bg: string; text: string; label: string }> = {
  PASS: { bg: "bg-green-100", text: "text-green-600", label: "✓ PASS" },
  FAIL: { bg: "bg-red-100",   text: "text-red-600",   label: "✗ FAIL" },
};

// TODO: These props will be passed from history/page.tsx after SearchHistory state is lifted up to parent
type TableSectionProps = {
  search?: string;
  fishFamily?: string;
  grade?: string;
  decision?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const TableSection = ({
  search = "",
  fishFamily = "all",
  grade = "all",
  decision = "all",
  dateFrom = "",
  dateTo = "",
}: TableSectionProps) => {
  // TODO: Replace this client-side filter with API query params once backend is ready
  // e.g. GET /api/v1/lots?search={search}&family={fishFamily}&grade={grade}&decision={decision}&from={dateFrom}&to={dateTo}
  const filteredLots = useMemo(() => {
    return MOCK_LOTS.filter((lot) => {
      if (search && !lot.lotId.toLowerCase().includes(search.toLowerCase())) return false;
      if (fishFamily !== "all" && lot.fishFamily !== fishFamily) return false;
      if (grade !== "all" && lot.grade !== grade) return false;
      if (decision !== "all" && lot.decision !== decision) return false;
      // TODO: Date range filter — requires lot.timestamp to include full date (ISO 8601), not just time string
      return true;
    });
  }, [search, fishFamily, grade, decision, dateFrom, dateTo]);

  const total = MOCK_LOTS.length; // TODO: Use total count from API response pagination metadata
  const passCount = filteredLots.filter((l) => l.decision === "PASS").length;
  const failCount = filteredLots.filter((l) => l.decision === "FAIL").length;
  const avgConfidence =
    filteredLots.length > 0
      ? (filteredLots.reduce((sum, l) => sum + l.confidence, 0) / filteredLots.length).toFixed(1)
      : "0.0";
  const passPercent = filteredLots.length > 0 ? Math.round((passCount / filteredLots.length) * 100) : 0;
  const failPercent = filteredLots.length > 0 ? Math.round((failCount / filteredLots.length) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Stats Bar */}
      <div className="pb-2 border-b border-slate-300">
        <p className="text-sm font-sans text-gray-700">
          Showing {filteredLots.length} of {total} records | Pass: {passCount} ({passPercent}%) | Fail: {failCount} ({failPercent}%) | Avg Confidence: {avgConfidence}%
        </p>
      </div>

      {/* Table Card */}
      <div className="w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-slate-300 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-slate-300">
              <th className="w-52 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Lot ID</th>
              <th className="w-28 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Timestamp</th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Fish Family</th>
              <th className="w-20 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Grade</th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Defects Found</th>
              <th className="w-28 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Decision</th>
              <th className="w-28 px-4 py-3 text-left text-xs font-medium font-sans text-gray-700">Confidence</th>
              <th className="w-24 px-4 py-3 text-right text-xs font-medium font-sans text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredLots.map((lot, index) => {
              const gradeStyle = GRADE_CONFIG[lot.grade];
              const decStyle = DECISION_CONFIG[lot.decision];
              return (
                <tr
                  key={lot.lotId}
                  className={`${index !== 0 ? "border-t border-slate-300" : ""} hover:bg-slate-50 transition-colors`}
                >
                  <td className="w-52 px-4 py-4">
                    <span className="text-sm font-medium font-mono text-sky-500">{lot.lotId}</span>
                  </td>
                  <td className="w-28 px-4 py-4">
                    <span className="text-sm font-medium font-mono text-gray-700">{lot.timestamp}</span>
                  </td>
                  <td className="w-32 px-4 py-4">
                    <span className="text-sm font-normal font-sans text-zinc-900">{lot.fishFamily}</span>
                  </td>
                  <td className="w-20 px-4 py-3.5">
                    <div className={`w-6 py-1 ${gradeStyle.bg} rounded-full inline-flex justify-center items-center`}>
                      <span className={`text-xs font-bold font-sans ${gradeStyle.text}`}>{lot.grade}</span>
                    </div>
                  </td>
                  <td className="w-32 px-4 py-4">
                    <span className="text-sm font-normal font-sans text-gray-700">
                      {lot.defectsCount} {lot.defectsCount === 1 ? "defect" : "defects"}
                    </span>
                  </td>
                  <td className="w-28 px-4 py-4">
                    <div className={`px-2.5 py-0.5 ${decStyle.bg} rounded-full inline-flex justify-center items-center`}>
                      <span className={`text-xs font-medium font-sans ${decStyle.text}`}>{decStyle.label}</span>
                    </div>
                  </td>
                  <td className="w-28 px-4 py-4">
                    <span className="text-sm font-medium font-mono text-sky-500">{lot.confidence}%</span>
                  </td>
                  <td className="w-24 px-4 py-3 text-right">
                    <Link
                      href={`/history/${lot.lotId}`}
                      className="inline-block px-3 py-1 rounded-sm outline outline-1 outline-slate-300 text-xs font-normal font-sans text-zinc-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {filteredLots.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm font-sans text-gray-500">
                  No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
