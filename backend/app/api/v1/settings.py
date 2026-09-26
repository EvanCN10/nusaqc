import re
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.ai import get_ai_engine
from app.models.system_setting import SystemSetting
from app.config import settings

router = APIRouter()


@router.get(
    "/models/status",
    summary="Get AI Model Status & Metadata",
    description="Powers AIModel.tsx with model versions, providers, and input shapes."
)
def get_models_status():
    ai = get_ai_engine()
    raw = ai.get_models_status()

    fresh_dict = raw.get("freshness_model") or raw.get("freshnessModel") or {
        "name": "MobileNetV3-Small Freshness Classifier",
        "version": "v1.0-onnx",
        "status": "Loaded (ONNX Runtime CPU)",
        "input_shape": [1, 3, 224, 224]
    }

    defect_dict = raw.get("defect_model") or raw.get("defectModel") or {
        "name": "YOLOv8s Surface Defect Detector",
        "version": "8.4.121",
        "status": "Loaded (ONNX Runtime CPU)",
        "input_shape": [1, 3, 640, 640]
    }

    return {
        "freshness_model": fresh_dict,
        "freshnessModel": fresh_dict,
        "defect_model": defect_dict,
        "defectModel": defect_dict,
    }

@router.get(
    "",
    summary="Get Active System Settings",
    description="Loads saved configurations for the settings page."
)
def get_settings(db: Session = Depends(get_db)):
    record = db.query(SystemSetting).filter(SystemSetting.key == "global_config").first()
    
    # Fallback defaults if not yet customized in database
    threshold = float(record.confidence_threshold) if record and record.confidence_threshold is not None else 0.75
    auto_export = bool(record.auto_export_csv) if record and record.auto_export_csv is not None else False
    retention = int(record.log_retention_days) if record and record.log_retention_days is not None else 30
    
    species = record.active_species.split(",") if (record and record.active_species) else ["Scombridae", "Cichlidae", "Salmonidae"]
    mock_mode = bool(record.mock_mode_enabled) if record and record.mock_mode_enabled is not None else settings.ENABLE_MOCK_HARDWARE
    auto_assign = bool(record.auto_assign_storage) if (record and hasattr(record, "auto_assign_storage") and record.auto_assign_storage is not None) else True

    # Return dual-compatible payload (snake_case + camelCase)
    return {
        # Confidence threshold
        "confidence_threshold": threshold,
        "confidenceThreshold": threshold,
        "confidenceThresholdPercent": int(threshold * 100) if threshold <= 1.0 else int(threshold),
        
        # CSV Export
        "auto_export_csv": auto_export,
        "autoExportCsv": auto_export,
        "autoExportCSV": auto_export,
        
        # Log retention
        "log_retention_days": retention,
        "logRetentionDays": retention,
        "logRetention": f"{retention} days",
        
        # Species & Hardware
        "active_species": species,
        "activeSpecies": species,
        "selectedSpecies": species,
        "mock_mode_enabled": mock_mode,
        "mockModeEnabled": mock_mode,
        "mockMode": mock_mode,

        # Storage Auto Assign
        "auto_assign_storage": auto_assign,
        "autoAssignStorage": auto_assign,
    }

@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Save System Settings (POST)"
)
@router.put(
    "",
    status_code=status.HTTP_200_OK,
    summary="Save System Settings (PUT)"
)
async def save_settings(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    record = db.query(SystemSetting).filter(SystemSetting.key == "global_config").first()

    # 1. Parse Confidence Threshold (handles 0.75 or 75)
    raw_thresh = payload.get("confidence_threshold")
    if raw_thresh is None:
        raw_thresh = payload.get("confidenceThreshold")
    if raw_thresh is not None:
        try:
            thresh = float(raw_thresh)
            if thresh > 1.0:
                thresh = thresh / 100.0  # Convert 75 -> 0.75
        except (ValueError, TypeError):
            thresh = record.confidence_threshold if record else 0.75
    else:
        thresh = record.confidence_threshold if record else 0.75

    # 2. Parse Auto Export CSV
    auto_exp = payload.get("auto_export_csv")
    if auto_exp is None:
        auto_exp = payload.get("autoExportCsv")
    if auto_exp is None:
        auto_exp = payload.get("autoExportCSV")
    if auto_exp is not None:
        auto_exp = bool(auto_exp)
    else:
        auto_exp = record.auto_export_csv if record else False

    # 3. Parse Log Retention Days (handles "30 days", "30", or 30)
    raw_retention = payload.get("log_retention_days")
    if raw_retention is None:
        raw_retention = payload.get("logRetentionDays")
    if raw_retention is None:
        raw_retention = payload.get("logRetention")
    if raw_retention is not None:
        if isinstance(raw_retention, str):
            digits = re.findall(r"\d+", raw_retention)
            retention = int(digits[0]) if digits else 30
        else:
            retention = int(raw_retention)
    else:
        retention = record.log_retention_days if record else 30

    # 4. Parse Active Species Whitelist
    raw_species = payload.get("active_species")
    if raw_species is None:
        raw_species = payload.get("activeSpecies")
    if raw_species is None:
        raw_species = payload.get("selectedSpecies")
    if raw_species is not None:
        if isinstance(raw_species, list):
            species_str = ",".join(raw_species)
        else:
            species_str = str(raw_species)
    else:
        species_str = record.active_species if record else "Scombridae,Cichlidae,Salmonidae"

    # 5. Parse Mock Mode
    raw_mock = payload.get("mock_mode_enabled")
    if raw_mock is None:
        raw_mock = payload.get("mockModeEnabled")
    if raw_mock is None:
        raw_mock = payload.get("mockMode")
    if raw_mock is not None:
        mock_mode = bool(raw_mock)
    else:
        mock_mode = record.mock_mode_enabled if record else True

    # 6. Parse Auto Assign Storage
    raw_auto_assign = payload.get("auto_assign_storage")
    if raw_auto_assign is None:
        raw_auto_assign = payload.get("autoAssignStorage")
    if raw_auto_assign is not None:
        auto_assign = bool(raw_auto_assign)
    else:
        auto_assign = record.auto_assign_storage if (record and hasattr(record, "auto_assign_storage")) else True

    # Persist changes into SQLite
    if not record:
        record = SystemSetting(
            key="global_config",
            confidence_threshold=thresh,
            auto_export_csv=auto_exp,
            log_retention_days=retention,
            active_species=species_str,
            mock_mode_enabled=mock_mode,
            auto_assign_storage=auto_assign
        )
        db.add(record)
    else:
        record.confidence_threshold = thresh
        record.auto_export_csv = auto_exp
        record.log_retention_days = retention
        record.active_species = species_str
        record.mock_mode_enabled = mock_mode
        if hasattr(record, "auto_assign_storage"):
            record.auto_assign_storage = auto_assign

    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "message": "Settings saved successfully",
        "saved_config": {
            "confidence_threshold": record.confidence_threshold,
            "confidenceThreshold": record.confidence_threshold,
            "auto_export_csv": record.auto_export_csv,
            "autoExportCsv": record.auto_export_csv,
            "log_retention_days": record.log_retention_days,
            "logRetentionDays": record.log_retention_days,
            "active_species": record.active_species.split(",") if record.active_species else [],
            "activeSpecies": record.active_species.split(",") if record.active_species else [],
            "mock_mode_enabled": record.mock_mode_enabled,
            "mockModeEnabled": record.mock_mode_enabled,
            "auto_assign_storage": getattr(record, "auto_assign_storage", True),
            "autoAssignStorage": getattr(record, "auto_assign_storage", True),
        }
    }
