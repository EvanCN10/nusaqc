import io
import os
import csv
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import settings
from app.api.deps import get_db
from app.models.inspection_record import InspectionRecord
from app.models.storage_slot import StorageSlot

router = APIRouter()

@router.get(
    "",
    # response_model=LotListResponseSchema,
    summary="Get Filterable & Paginated Lot Inspection History",
    description="Powers TableSection.tsx with search, family filtering, grade filtering, and date range."
)
def get_lots(
    search: Optional[str] = Query(None, description="Search by lot_id prefix or full text"),
    family: Optional[str] = Query(None, description="Filter by fish family (e.g., Scombridae)"),
    fish_family: Optional[str] = Query(None, description="Alias for family"),
    grade: Optional[str] = Query(None, description="Filter by grade (A, B, C)"),
    decision: Optional[str] = Query(None, description="Filter by decision (PASS, FAIL, CONDITIONAL)"),
    from_date: Optional[str] = Query(None, description="ISO Date start (YYYY-MM-DD)"),
    from_param: Optional[str] = Query(None, alias="from", description="ISO Date start (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="ISO Date end (YYYY-MM-DD)"),
    to_param: Optional[str] = Query(None, alias="to", description="ISO Date end (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    query = db.query(InspectionRecord)

    # Search filter
    if search:
        query = query.filter(InspectionRecord.lot_id.ilike(f"%{search}%"))

    # Attribute filters
    selected_family = family or fish_family
    if selected_family:
        query = query.filter(InspectionRecord.fish_family == selected_family)
    if grade:
        query = query.filter(InspectionRecord.grade == grade.upper())
    if decision:
        query = query.filter(InspectionRecord.decision == decision.upper())

    # Date range filters
    effective_from = from_date or from_param
    effective_to = to_date or to_param

    if effective_from:
        try:
            start_dt = datetime.strptime(effective_from, "%Y-%m-%d")
            query = query.filter(InspectionRecord.timestamp >= start_dt)
        except ValueError:
            pass
    if effective_to:
        try:
            end_dt = datetime.strptime(f"{effective_to} 23:59:59", "%Y-%m-%d %H:%M:%S")
            query = query.filter(InspectionRecord.timestamp <= end_dt)
        except ValueError:
            pass

    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)
    
    # Sort newest first & paginate
    records = query.order_by(desc(InspectionRecord.timestamp)).offset((page - 1) * limit).limit(limit).all()

    items = [
        {
            "id": r.id,
            "lot_id": r.lot_id,
            "lotId": r.lot_id,  # For camelCase compatibility
            "timestamp": r.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "fish_family": r.fish_family,
            "family": r.fish_family,  # For camelCase compatibility
            "grade": r.grade,
            "grade_confidence": r.grade_confidence,
            "defects_count": r.defects_count,
            "defectsCount": r.defects_count,  # For camelCase compatibility
            "decision": r.decision,
            "hardware_signal": r.hardware_signal,
            "conveyorSignal": r.hardware_signal,  # For camelCase compatibility
            "processing_time_ms": r.processing_time_ms,
            "ProcessingTimeMs": r.processing_time_ms, # For camelCase compatibility
            "image_path": r.image_path,
            "imageUrl": r.image_path # For camelCase compatibility
        }
        for r in records
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "totalPages": total_pages  # For camelCase compatibility
    }


@router.get(
    "/recent",
    # response_model=List[LotRecordSchema],
    summary="Get 5 Most Recent Inspections",
    description="Powers RecentInspections.tsx on the dashboard."
)
def get_recent_lots(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    records = db.query(InspectionRecord).order_by(desc(InspectionRecord.timestamp)).limit(limit).all()
    return [
        {
            "id": r.id,
            "lot_id": r.lot_id,
            "lotID": r.lot_id, # For camelCase compatibility
            "timestamp": r.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "fish_family": r.fish_family,
            "family": r.fish_family, # For camelCase compatibility
            "grade": r.grade,
            "grade_confidence": r.grade_confidence,
            "defects_count": r.defects_count,
            "defectsCount": r.defects_count, # For camelCase compatibility
            "decision": r.decision,
            "hardware_signal": r.hardware_signal,
            "hardwareSignal": r.hardware_signal, # For camelCase compatibility
            "processing_time_ms": r.processing_time_ms,
            "processingTimeMs": r.processing_time_ms, # For camelCase compatibility
            "image_path": r.image_path,
            "imageUrl": r.image_path, # For camelCase compatibility
        }
        for r in records
    ]

@router.get(
    "/export",
    summary="Export Inspection QC Audit Report to CSV"
)
@router.get(
    "/export/csv",
    summary="Export Inspection QC Audit Report to CSV",
    description="Streams a formatted CSV file compliant with factory traceability audit standards."
)
def export_lots_csv(
    from_date: Optional[str] = Query(None),
    from_param: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None),
    to_param: Optional[str] = Query(None, alias="to"),
    family: Optional[str] = Query(None),
    fish_family: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(InspectionRecord)
    selected_family = family or fish_family
    if selected_family:
        query = query.filter(InspectionRecord.fish_family == selected_family)

    effective_from = from_date or from_param
    effective_to = to_date or to_param

    if effective_from:
        try:
            query = query.filter(InspectionRecord.timestamp >= datetime.strptime(effective_from, "%Y-%m-%d"))
        except ValueError:
            pass
    if effective_to:
        try:
            query = query.filter(InspectionRecord.timestamp <= datetime.strptime(f"{effective_to} 23:59:59", "%Y-%m-%d %H:%M:%S"))
        except ValueError:
            pass

    records = query.order_by(desc(InspectionRecord.timestamp)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV Header
    writer.writerow([
        "Lot ID", "Timestamp (UTC)", "Fish Family", "Freshness Grade", 
        "Grade Confidence (%)", "Defects Count", "Decision", "Hardware Signal", 
        "Processing Latency (ms)", "Image Path"
    ])

    for r in records:
        writer.writerow([
            r.lot_id,
            r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            r.fish_family,
            r.grade,
            f"{(r.grade_confidence * 100):.1f}%",
            r.defects_count,
            r.decision,
            r.hardware_signal,
            r.processing_time_ms,
            r.image_path or ""
        ])

    output.seek(0)
    filename = f"nusaqc_shift_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/{lot_id}",
    # response_model=LotDetailSchema,
    summary="Get Detailed Lot Inspection Record",
    description="Powers the inspection breakdown on /history/[lotId]."
)
def get_lot_by_id(
    lot_id: str,
    db: Session = Depends(get_db)
):
    record = db.query(InspectionRecord).filter(InspectionRecord.lot_id == lot_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lot record '{lot_id}' not found."
        )

    # Parse stored JSON defectsi array
    raw_defects = json.loads(record.defects_json or "[]")

    # defects = [
    #     DefectSchema(
    #         label=d.get("label", "foreign_object"),
    #         bbox=d.get("bbox", [0, 0, 0, 0]),
    #         confidence=d.get("confidence", 1.0)
    #     )
    #     for d in raw_defects
    # ]

    return {
        "id": record.id,
        "lot_id": record.lot_id,
        "lotId": record.lot_id,
        "timestamp": record.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "fish_family": record.fish_family,
        "family": record.fish_family,
        "grade": record.grade,
        "grade_confidence": record.grade_confidence,
        "confidence": round(record.grade_confidence * 100, 1) if record.grade_confidence <= 1.0 else record.grade_confidence,
        "defects_count": record.defects_count,
        "defectsCount": record.defects_count,
        "decision": record.decision,
        "hardware_signal": record.hardware_signal,
        "conveyorSignal": record.hardware_signal,
        "processing_time_ms": record.processing_time_ms,
        "processingTimeMs": record.processing_time_ms,
        "image_path": record.image_path,
        "imageUrl": record.image_path,
        "defects": raw_defects
    }


@router.delete(
    "/{lot_id}",
    summary="Delete Lot Inspection Record",
    description="Deletes an inspection record by lot_id, unassigns any storage slot holding it, and removes stored image."
)
def delete_lot_by_id(
    lot_id: str,
    db: Session = Depends(get_db)
):
    record = db.query(InspectionRecord).filter(InspectionRecord.lot_id == lot_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lot record '{lot_id}' not found."
        )

    # 1. Unassign from storage slots if occupied
    slots = db.query(StorageSlot).filter(StorageSlot.lot_id == lot_id).all()
    for slot in slots:
        slot.lot_id = None
        slot.assigned_at = None

    # 2. Try to remove image file if stored locally in uploads
    if record.image_path and record.image_path.startswith("/uploads/"):
        filename = record.image_path.replace("/uploads/", "")
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

    # 3. Delete inspection record
    db.delete(record)
    db.commit()

    return {
        "status": "success",
        "message": f"Lot record '{lot_id}' deleted successfully.",
        "lot_id": lot_id
    }
 