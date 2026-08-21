export type Decision = "PASS" | "FAIL" | "CONDITIONAL";
export type HardwareSignal = "GREEN" | "YELLOW" | "RED";
export type Grade = "A" | "B" | "C";

export type DefectLabel = 
  | "sisik_sisa" 
  | "warna_abnormal" 
  | "luka_robekan" 
  | "lendir_berlebih"
  | string;

export interface Defect {
  label: DefectLabel;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] in original image space
  confidence: number;
}

export interface InspectionResult {
  lotId: string;
  lot_id?: string;
  timestamp: string;
  family: string;
  fish_family?: string;
  grade: Grade;
  confidence: number;
  grade_confidence?: number;
  defects: Defect[];
  decision: Decision;
  conveyorSignal: HardwareSignal;
  hardware_signal?: HardwareSignal;
  processingTimeMs: number;
  processing_time_ms?: number;
  imageUrl?: string;
  image_url?: string;
  freshnessNote?: string;
}

export interface LotRecord {
  id: number;
  lotId: string;
  lot_id?: string;
  timestamp: string;
  family: string;
  fish_family?: string;
  grade: Grade;
  confidence: number;
  grade_confidence?: number;
  defectsCount: number;
  defects_count?: number;
  decision: Decision;
  conveyorSignal: HardwareSignal;
  hardware_signal?: HardwareSignal;
  imageUrl?: string;
  image_path?: string;
  processing_time_ms?: number;
  processingTimeMs?: number;
  defects?: Defect[];
}

export interface DashboardStats {
  total_inspected_today: number;
  totalInspectedToday?: number;
  current_lot_id: string;
  currentLotId?: string;
  pass_rate: number;
  passRate?: number;
  pass_rate_delta: number;
  passRateDelta?: number;
  fail_rate: number;
  failRate?: number;
  fail_rate_delta: number;
  failRateDelta?: number;
  avg_confidence: number;
  avg_confidence_score?: number;
  avgConfidence?: number;
}

export interface HardwareStatus {
  camera: string;
  conveyor_relay?: string;
  conveyor?: string;
  tower_light?: string;
  towerLight?: string;
  buzzer?: string;
  mock_mode: boolean;
  mockMode?: boolean;
  mockModeEnabled?: boolean;
}