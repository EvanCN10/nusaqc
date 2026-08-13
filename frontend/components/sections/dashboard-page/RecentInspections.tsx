import React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { GradeBadge } from "@/components/common/GradeBadge";
import { StatusBadge } from "@/components/common/StatusBadge";

// TODO: Replace with API call - GET /api/v1/lots/recent?limit=5
const MOCK_INSPECTIONS = [
  { lotId: "LOT-2026-0730-005", fishFamily: "Scombridae", grade: "A", decision: "PASS", confidence: "92.1%", time: "2 min ago" },
  { lotId: "LOT-2026-0730-004", fishFamily: "Cichlidae",  grade: "B", decision: "PASS", confidence: "87.4%", time: "5 min ago" },
  { lotId: "LOT-2026-0730-003", fishFamily: "Scombridae", grade: "C", decision: "FAIL", confidence: "61.2%", time: "8 min ago" },
  { lotId: "LOT-2026-0730-002", fishFamily: "Cichlidae",  grade: "A", decision: "PASS", confidence: "94.8%", time: "12 min ago" },
  { lotId: "LOT-2026-0730-001", fishFamily: "Scombridae", grade: "B", decision: "PASS", confidence: "79.3%", time: "18 min ago" },
] as const;

const TH_CLASS = "px-4 py-2 text-left text-xs font-medium font-sans uppercase tracking-wide text-gray-700";

export const RecentInspections = () => {
  return (
    <div className="flex-1 self-stretch bg-white rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-300/30 flex items-center gap-2">
        <ClipboardList className="size-3.5 text-slate-400" />
        <span className="text-base font-bold font-sans text-zinc-900">Recent Inspections</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-300/20 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
              <th className={`${TH_CLASS} w-44`}>Lot ID</th>
              <th className={`${TH_CLASS} w-28`}>Fish Family</th>
              <th className={`${TH_CLASS} w-20`}>Grade</th>
              <th className={`${TH_CLASS} w-24`}>Decision</th>
              <th className={`${TH_CLASS} w-28`}>Confidence</th>
              <th className={`${TH_CLASS} w-28 text-right`}>Time</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INSPECTIONS.map((row, i) => (
              <tr key={row.lotId} className={i !== 0 ? "border-t border-slate-300/10" : ""}>
                <td className="px-4 py-3.5 w-44">
                  <Link
                    href={`/history/${row.lotId}`}
                    className="text-xs font-normal font-mono text-sky-500 hover:underline"
                  >
                    {row.lotId}
                  </Link>
                </td>
                <td className="px-4 py-4 w-28 text-xs font-normal font-sans text-zinc-900">{row.fishFamily}</td>
                <td className="px-4 py-3 w-20">
                  <GradeBadge grade={row.grade} />
                </td>
                <td className="px-4 py-3 w-24">
                  <StatusBadge decision={row.decision} />
                </td>
                <td className="px-4 py-4 w-28 text-xs font-medium font-sans text-zinc-900">{row.confidence}</td>
                <td className="px-4 py-4 w-28 text-xs font-normal font-mono text-slate-300 text-right">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-300/30 flex justify-end">
        <Link
          href="/history"
          className="text-xs font-semibold font-sans tracking-wide text-sky-700 hover:text-sky-500 transition-colors"
        >
          VIEW ALL
        </Link>
      </div>
    </div>
  );
};
