from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_db
from app.schemas.inspection import InspectionResultSchema
from app.services.inspection_service import InspectionService

router = APIRouter()

@router.post(
    "/run",
    # response_model=InspectionResultSchema,
    status_code=status.HTTP_200_OK,
    summary="Run Fish Quality Inspection Snapshot",
    description="Processes a single snapshot image, computes freshness & defects, sets hardware signal, and stores QC log."
)
async def run_inspection(
    image: Optional[UploadFile] = File(None, description="Snapshot image file of the fish on conveyor"),
    file: Optional[UploadFile] = File(None, description="Alternative alias for snapshot image file"),
    fish_family: Optional[str] = Form(None, description="Fish type (e.g. Tuna, Mackarel, Nila)"),
    family: Optional[str] = Form(None, description="Frontend alias for fish_family"),
    lot_id: Optional[str] = Form(None, description="Optional custom lot identifier"),
    # Optional precomputed fields from edge IoT
    grade: Optional[str] = Form(None, description="Edge computed freshness grade (A/B/C)"),
    grade_confidence: Optional[float] = Form(None, description="Edge computed grade confidence"),
    defects: Optional[str] = Form(None, description="Edge detected defect bboxes (JSON string)"),
    decision: Optional[str] = Form(None, description="Edge decision (PASS/CONDITIONAL/FAIL)"),
    hardware_signal: Optional[str] = Form(None, description="Edge hardware signal (GREEN/YELLOW/RED)"),
    conveyor_signal: Optional[str] = Form(None, description="Alias for hardware_signal"),
    reason: Optional[str] = Form(None, description="Edge decision explanation summary"),
    processing_time_ms: Optional[int] = Form(None, description="Edge processing duration in ms"),
    db: Session = Depends(get_db)
):
    upload_file = image or file
    if upload_file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Snapshot image file is required (pass 'image' or 'file')."
        )

    selected_family = family or fish_family or "Tuna"  # Default to Tuna if not provided

    # Validate image file type
    if upload_file.content_type and not upload_file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid image (JPEG, PNG, WEBP)."
        )

    image_bytes = await upload_file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty."
        )

    # Parse defects JSON if provided
    import json
    parsed_defects = None
    if defects:
        try:
            parsed_defects = json.loads(defects)
        except Exception:
            parsed_defects = None

    signal_choice = hardware_signal or conveyor_signal

    # Execute inspection pipeline
    result = await InspectionService.process_inspection(
        image_bytes=image_bytes,
        filename=upload_file.filename or "snapshot.jpg",
        fish_family=selected_family,
        db=db,
        custom_lot_id=lot_id,
        edge_grade=grade,
        edge_grade_confidence=grade_confidence,
        edge_defects=parsed_defects,
        edge_decision=decision,
        edge_hardware_signal=signal_choice,
        edge_reason=reason,
        edge_processing_time_ms=processing_time_ms
    )

    # Return dual-compatible payload (snake_case + camelCase)
    res_dict = result.model_dump() if hasattr(result, "model_dump") else result.dict()
    res_dict.update({
        "lotId": result.lot_id,
        "confidence": round(result.grade_confidence * 100, 1) if result.grade_confidence <= 1.0 else result.grade_confidence,
        "conveyorSignal": result.hardware_signal,
        "freshnessNote": f"Grade {result.grade} ({int(result.grade_confidence * 100) if result.grade_confidence <= 1.0 else int(result.grade_confidence)}% confidence)",
        "processingTimeMs": result.processing_time_ms,
        "imageUrl": result.image_url,
        "agentReasoning": result.agent_reasoning,
        "adjudicatedBy": result.adjudicated_by,
        "storageSlot": result.storage_slot,
        "storageZone": result.storage_zone,
    })
    return res_dict


# Endpoint Alias for compatibility with Section 8.3 of Proposal V3
@router.post(
    "/inspect",
    include_in_schema=False
)
async def inspect_fish_alias(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    fish_family: Optional[str] = Form(None),
    family: Optional[str] = Form(None),
    lot_id: Optional[str] = Form(None),
    grade: Optional[str] = Form(None),
    grade_confidence: Optional[float] = Form(None),
    defects: Optional[str] = Form(None),
    decision: Optional[str] = Form(None),
    hardware_signal: Optional[str] = Form(None),
    conveyor_signal: Optional[str] = Form(None),
    reason: Optional[str] = Form(None),
    processing_time_ms: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    return await run_inspection(
        image=image,
        file=file,
        fish_family=fish_family,
        family=family,
        lot_id=lot_id,
        grade=grade,
        grade_confidence=grade_confidence,
        defects=defects,
        decision=decision,
        hardware_signal=hardware_signal,
        conveyor_signal=conveyor_signal,
        reason=reason,
        processing_time_ms=processing_time_ms,
        db=db
    )