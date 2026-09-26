import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

# backend/app/api/v1/jury_samples.py -> parent(v1) -> parent(app) -> parent(backend) / "data" / "jury_samples"
SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "jury_samples"

JURY_PRESETS = [
    {
        "id": "grade_a",
        "label": "Grade A (Prime Export)",
        "badge": "PASS",
        "fish_type": "Tuna",
        "description": "Ikan tuna segar utuh terkalibrasi untuk demonstrasi status PASS (Sinyal Hijau).",
        "filename": "jury_sample_grade_a.jpg"
    },
    {
        "id": "conditional",
        "label": "Borderline / Marginal (AWS Bedrock Demo)",
        "badge": "CONDITIONAL",
        "fish_type": "Mackarel",
        "description": "Kondisi ambang batas yang memicu Agentic Adjudication via Claude Vision / Nova Pro.",
        "filename": "jury_sample_conditional.jpg"
    },
    {
        "id": "grade_c",
        "label": "Grade C (Defect / Reject)",
        "badge": "FAIL",
        "fish_type": "Nila",
        "description": "Ikan mengalami dekomposisi atau cacat mutu untuk demonstrasi status FAIL (Sinyal Merah).",
        "filename": "jury_sample_grade_c.jpg"
    }
]

@router.get("/samples")
def get_jury_samples():
    return JURY_PRESETS

@router.get("/sample/{sample_id}")
def get_jury_sample_image(sample_id: str):
    preset = next((p for p in JURY_PRESETS if p["id"] == sample_id), None)
    if not preset:
        raise HTTPException(status_code=404, detail=f"Preset sample '{sample_id}' tidak ditemukan")
    
    file_path = SAMPLES_DIR / preset["filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File gambar preset '{preset['filename']}' tidak ditemukan di {file_path}")
    
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",
        filename=preset["filename"]
    )
