import base64
import io
import json
import logging
import re
from typing import Dict, Any, List, Optional
import httpx
from PIL import Image

from app.config import settings

logger = logging.getLogger("nusaqc.agentic_adjudication")


class AgenticAdjudicationService:
    """
    MP-01 Agentic Adjudication Service
    Performs second-opinion sensory & organoleptic evaluation (SNI 01-2729-2006)
    using AWS Bedrock Multimodal Vision for lots with CONDITIONAL status.
    """

    @classmethod
    async def adjudicate(
        cls,
        image_bytes: bytes,
        lot_id: str,
        grade: str,
        grade_confidence: float,
        defects_json: List[Dict[str, Any]],
        fish_family: str,
    ) -> Dict[str, Any]:
        """
        Adjudicate an inspection lot using AWS Bedrock Multimodal Vision.

        Returns:
            dict with:
                - final_decision: 'PASS' | 'FAIL'
                - agent_reasoning: str
                - adjudicated_by: 'agent' | 'agent_fallback'
        """
        token = settings.AWS_BEARER_TOKEN_BEDROCK
        region = settings.AWS_REGION or "us-east-1"
        model_id = getattr(settings, "AWS_BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")

        if not token:
            logger.warning("[Agentic Adjudication] AWS_BEARER_TOKEN_BEDROCK not configured. Defaulting to safe FAIL.")
            return {
                "final_decision": "FAIL",
                "agent_reasoning": "AWS Bedrock token belum terkonfigurasi. Sistem menerapkan safe failover.",
                "adjudicated_by": "agent_fallback",
            }

        # 1. Normalize image to standardized RGB JPEG bytes
        # Supports PNG, JPG, WEBP, GIF, BMP, etc., and strips alpha channels
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            buf = io.BytesIO()
            pil_image.save(buf, format="JPEG", quality=90)
            normalized_bytes = buf.getvalue()
        except Exception as norm_err:
            logger.warning(f"[Agentic Adjudication] Image normalization failed ({norm_err}), using raw bytes.")
            normalized_bytes = image_bytes

        # 2. Base64 encode snapshot
        base64_image = base64.b64encode(normalized_bytes).decode("utf-8")

        # 3. Format defect summary
        if defects_json:
            defects_summary = ", ".join(
                [f"{d.get('label', 'defect')} ({round(d.get('confidence', 0.0) * 100)}%)" for d in defects_json]
            )
        else:
            defects_summary = "Tidak ada defek fisik signifikan yang terdeteksi secara otomatis."

        conf_pct = round(grade_confidence * 100, 1) if grade_confidence <= 1.0 else round(grade_confidence, 1)

        # 4. Construct SNI 01-2729 Domain-Specific Prompt
        prompt = f"""Anda adalah Senior Quality Control Inspector bersertifikat SNI 01-2729 (Standar Mutu Ikan Segar Ekspor) di NusaQC.
Tugas Anda adalah melakukan Agentic Adjudication (evaluasi cerdas tahap kedua) untuk lot ikan yang hasil deteksi awalnya berstatus "CONDITIONAL" (borderline).

Data Inspeksi Awal:
- Lot ID: {lot_id}
- Spesies Ikan: {fish_family}
- Model Grade: {grade} (Tingkat Keyakinan: {conf_pct}%)
- Defek Fisik Terdeteksi YOLO: {defects_summary}

Instruksi Analisis Organoleptik:
1. Evaluasi foto secara mendalam sesuai kriteria mutu SNI 01-2729:
   - Mata: kornea jernih/cembung vs cekung/keruh.
   - Insang & Permukaan Kulit: kecerahan warna, integritas lendir alami, ada/tidaknya diskolorasi atau lesi parah.
   - Dinding Perut & Tekstur: keutuhan perut, elastisitas fisik visual.
2. Tentukan KEPUTUSAN FINAL: hanya boleh "PASS" (lolos kelayakan konsumsi/ekspor) atau "FAIL" (reject/tidak lolos).
3. Berikan penalaran profesional ringkas (maksimal 2-3 kalimat) dalam Bahasa Indonesia teknis QC.

Keluarkan respon HANYA dalam format JSON valid tanpa teks atau markdown tambahan:
{{
  "decision": "PASS",
  "reasoning": "Penalaran organoleptik berdasarkan foto..."
}}"""

        # 5. Invoke AWS Bedrock API
        models_to_try = [model_id]
        if model_id != "amazon.nova-lite-v1:0":
            models_to_try.append("amazon.nova-lite-v1:0")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "jpeg",
                                "source": {
                                    "bytes": base64_image
                                }
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        for current_model in models_to_try:
            url = f"https://bedrock-runtime.{region}.amazonaws.com/model/{current_model}/invoke"
            try:
                async with httpx.AsyncClient(timeout=25.0) as client:
                    response = await client.post(url, headers=headers, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    raw_text = data.get("output", {}).get("message", {}).get("content", [{}])[0].get("text", "")
                    parsed = cls._parse_json_response(raw_text)
                    if parsed:
                        decision = parsed.get("decision", "FAIL").upper()
                        if decision not in ["PASS", "FAIL"]:
                            decision = "FAIL"
                        reasoning = parsed.get("reasoning", "Adjudikasi AI Bedrock selesai.")
                        logger.info(f"[Agentic Adjudication] {lot_id} -> {decision} ({reasoning})")
                        return {
                            "final_decision": decision,
                            "agent_reasoning": reasoning,
                            "adjudicated_by": "agent",
                        }
                    else:
                        logger.warning(f"[Agentic Adjudication] Failed to parse JSON from {current_model}: {raw_text}")
                else:
                    logger.warning(f"[Agentic Adjudication] {current_model} returned {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[Agentic Adjudication] Error connecting to {current_model}: {str(e)}")

        # Fallback to safe mode
        return {
            "final_decision": "FAIL",
            "agent_reasoning": "Adjudikasi AI tidak dapat terhubung ke AWS Bedrock. Sistem default ke FAIL untuk menjaga standar keamanan pangan (safe mode).",
            "adjudicated_by": "agent_fallback",
        }

    @staticmethod
    def _parse_json_response(text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON from model output text."""
        if not text:
            return None
        text_clean = text.strip()
        # Remove markdown codeblocks if present
        if "```json" in text_clean:
            match = re.search(r"```json\s*(\{.*?\})\s*```", text_clean, re.DOTALL)
            if match:
                text_clean = match.group(1)
        elif "```" in text_clean:
            match = re.search(r"```\s*(\{.*?\})\s*```", text_clean, re.DOTALL)
            if match:
                text_clean = match.group(1)

        try:
            return json.loads(text_clean)
        except Exception:
            # Fallback regex search for json object
            match = re.search(r'\{.*?"decision".*?\}', text_clean, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
        return None
