// types/index.ts (BELUM FIX)

export type Decision = "PASS" | "FAIL" | "CONDITIONAL";
export type HardwareSignal = "GREEN" | "YELLOW" | "RED";
export type Grade = "A" | "B" | "C";

export type Defect = {
  label: "sisik_sisa" | "warna_abnormal" | "luka_robekan" | "foreign_object" | "lendir_berlebih";
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
};

export type InspectionResult = {
  lot_id: string;
  timestamp: string; // ISO 8601
  fish_family: "Scombridae" | "Cichlidae" | "Salmonidae";
  grade: Grade;
  grade_confidence: number;
  defects: Defect[];
  decision: Decision;
  hardware_signal: HardwareSignal;
  processing_time_ms: number;
};

export type LotSummary = {
  lot_id: string;
  fish_family: string;
  grade: Grade;
  decision: Decision;
  confidence: number;
  timestamp: string;
};

export type DashboardStats = {
  total_inspected_today: number;
  current_lot_id: string;
  pass_rate: number;
  pass_rate_delta: number;
  fail_rate: number;
  fail_rate_delta: number;
  avg_confidence_score: number;
};

export type HardwareStatus = {
  camera: "ONLINE" | "OFFLINE";
  conveyor_relay: "ACTIVE" | "INACTIVE";
  tower_light: "GREEN" | "YELLOW" | "RED";
  mock_mode_enabled: boolean;
};