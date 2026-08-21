import { InspectionResult, LotRecord, DashboardStats, HardwareStatus } from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to convert backend relative image paths (/uploads/...) to full browser URLs
export function getFullImageUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export async function runInspection(imageFile: File, fishFamily: string, lotId?: string): Promise<InspectionResult> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("fish_family", fishFamily);
  formData.append("family", fishFamily);
  if (lotId) formData.append("lot_id", lotId);

  const res = await fetch(`${API_BASE}/api/v1/inspections/run`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Inspection request failed");
  }
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
  return res.json();
}

export async function fetchRecentLots(limit = 5): Promise<LotRecord[]> {
  const res = await fetch(`${API_BASE}/api/v1/lots/recent?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch recent lot inspections");
  return res.json();
}

export async function fetchLots(params: {
  search?: string;
  family?: string;
  grade?: string;
  decision?: string;
  from?: string;
  to?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.family) query.set("family", params.family);
  if (params.grade) query.set("grade", params.grade);
  if (params.decision) query.set("decision", params.decision);
  const fromVal = params.from || params.date_from;
  const toVal = params.to || params.date_to;
  if (fromVal) query.set("from", fromVal);
  if (toVal) query.set("to", toVal);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/v1/lots?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch lot history");
  return res.json();
}

export async function fetchLotDetail(lotId: string): Promise<LotRecord> {
  const res = await fetch(`${API_BASE}/api/v1/lots/${lotId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Lot record '${lotId}' not found`);
  return res.json();
}

export const fetchLotById = fetchLotDetail;

export async function fetchHardwareStatus(): Promise<HardwareStatus> {
  const res = await fetch(`${API_BASE}/api/v1/hardware/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hardware status");
  return res.json();
}

export async function fetchModelsStatus() {
  const res = await fetch(`${API_BASE}/api/v1/settings/models/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch AI models status");
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/api/v1/settings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function saveSettings(payload: any) {
  const res = await fetch(`${API_BASE}/api/v1/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export async function testDeviceConnection(ipAddress: string) {
  const res = await fetch(`${API_BASE}/api/v1/hardware/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ipAddress }),
  });
  return res.json();
}

export function getExportCsvUrl(params?: { from?: string; to?: string; family?: string }): string {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.family) query.set("family", params.family);
  return `${API_BASE}/api/v1/lots/export/csv?${query.toString()}`;
}