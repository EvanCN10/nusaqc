"use client";

import { useEffect, useState, useCallback } from "react";
import { HeadSection } from "@/components/sections/dashboard-page/HeadSection";
import { BodySection } from "@/components/sections/dashboard-page/BodySection";
import { fetchDashboardStats, fetchRecentLots, fetchHardwareStatus } from "@/lib/api";
import { DashboardStats, LotRecord, HardwareStatus as HardwareStatusType } from "@/types";
import { RefreshCw, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLots, setRecentLots] = useState<LotRecord[]>([]);
  const [hardware, setHardware] = useState<HardwareStatusType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadAllData = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const [sData, lData, hData] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchRecentLots(5).catch(() => []),
        fetchHardwareStatus().catch(() => null),
      ]);
      if (sData) setStats(sData);
      if (lData) setRecentLots(lData);
      if (hData) setHardware(hData);
      setLastRefreshed(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + periodic polling fallback
  useEffect(() => {
    loadAllData(true);
    const interval = setInterval(() => {
      loadAllData(false);
    }, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [loadAllData]);

  // WebSocket Live Real-time Connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/events";
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "NEW_INSPECTION" || data.event === "NEW_INSPECTION") {
              // Immediately refresh data on new inspection
              loadAllData(false);
            }
          } catch {
            // Non-json ping/pong
          }
        };
        ws.onerror = () => {
          setWsConnected(false);
        };
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [loadAllData]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Dashboard Sub-header with Live Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg shadow-xs border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans text-zinc-900 leading-tight">
              Real-Time QC Monitoring Dashboard
            </h1>
            <p className="text-xs font-sans text-gray-500">
              Sistem Otomasi Sortasi Mutu Ikan Segar & Deteksi Cacat Permukaan (SNI 2729:2013)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live WS Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              wsConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <Radio className={`size-3 ${wsConnected ? "animate-pulse text-emerald-600" : "text-amber-500"}`} />
            <span>{wsConnected ? "WebSocket LIVE" : "Polling Mode"}</span>
          </div>

          <Button
            variant="outline-sky"
            size="sm"
            onClick={() => loadAllData(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 h-8 text-xs cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <HeadSection stats={stats} isLoading={isLoading} />

      {/* Live Table + Hardware Card */}
      <BodySection lots={recentLots} hardwareStatus={hardware} isLoading={isLoading} />
    </div>
  );
}