import asyncio
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.models.storage_slot import StorageSlot
from app.models.inspection_record import InspectionRecord
from app.core.websocket import ws_manager

logger = logging.getLogger("nusaqc.storage_allocator")


class SmartStorageAllocator:
    """
    MP-03 Smart Storage Auto-Assign Service
    Implements intelligent cold-chain placement optimization based on fish grade,
    temperature zone requirements, and shelf-life urgency.
    """

    @classmethod
    def ensure_storage_slots(cls, db: Session):
        """Seed 35 default storage slots if none exist."""
        if db.query(StorageSlot).count() == 0:
            slots = []
            # 1. Cold Zone (5 rows A-E x 5 cols = 25 slots)
            for row in ["A", "B", "C", "D", "E"]:
                for col in range(1, 6):
                    slot_id = f"{row}{col:02d}"
                    slots.append(StorageSlot(slot_id=slot_id, zone="cold", lot_id=None))

            # 2. Frozen Zone (10 slots F-01 to F-10)
            for col in range(1, 11):
                slot_id = f"F-{col:02d}"
                slots.append(StorageSlot(slot_id=slot_id, zone="frozen", lot_id=None))

            db.add_all(slots)
            db.commit()

    @classmethod
    def auto_assign(cls, db: Session, record: InspectionRecord) -> Optional[Dict[str, Any]]:
        """
        Auto-assign a PASS lot to the optimal cold/frozen storage slot.

        Rules:
        - Only lots with decision == 'PASS' are placed in storage.
        - Grade A (Premium/Export): Prioritizes Cold Zone A01-A05, then B01-B05 (Rapid Access Cold Zone).
        - Grade B: Prioritizes Cold Zone C01-E05, with fallback to Frozen Zone F-01-F-10.
        - Already assigned lots return current slot info without reassigning.
        """
        if record.decision != "PASS":
            logger.info(f"[Storage Allocator] Skipping lot {record.lot_id} because decision is {record.decision}.")
            return None

        # If already stored and still valid
        if record.storage_slot and record.dispatch_id is None:
            return {
                "lot_id": record.lot_id,
                "slot_id": record.storage_slot,
                "zone": record.storage_zone,
                "recommendation_reason": "Lot telah teralokasi pada slot penyimpanan.",
                "already_assigned": True,
            }

        cls.ensure_storage_slots(db)

        # Build candidate slot priority list based on grade
        grade = (record.grade or "A").upper()
        candidate_slot_ids: List[str] = []
        reason_template = ""

        if grade == "A":
            # Tier 1: Prime cold access (A01-A05, B01-B05)
            tier1 = [f"{r}{c:02d}" for r in ["A", "B"] for c in range(1, 6)]
            # Tier 2: General cold (C01-E05)
            tier2 = [f"{r}{c:02d}" for r in ["C", "D", "E"] for c in range(1, 6)]
            candidate_slot_ids = tier1 + tier2
            reason_template = "Grade A Ekspor dialokasikan ke Cold Zone (0–4°C) prioritas tinggi untuk menjaga kesegaran optimal."
        else:
            # Grade B or other: Tier 1: Mid-tier cold (C01-E05)
            tier1 = [f"{r}{c:02d}" for r in ["C", "D", "E"] for c in range(1, 6)]
            # Tier 2: Frozen zone for prolonged preservation (F-01 to F-10)
            tier2 = [f"F-{c:02d}" for c in range(1, 11)]
            # Tier 3: Any cold slot
            tier3 = [f"{r}{c:02d}" for r in ["A", "B"] for c in range(1, 6)]
            candidate_slot_ids = tier1 + tier2 + tier3
            reason_template = f"Grade {grade} dialokasikan ke zona penyimpanan standar/frozen untuk stabilisasi rantai dingin."

        # Fetch empty slots from database
        empty_slots = db.query(StorageSlot).filter(StorageSlot.lot_id == None).all()
        empty_slot_map = {s.slot_id: s for s in empty_slots}

        selected_slot: Optional[StorageSlot] = None
        for candidate_id in candidate_slot_ids:
            if candidate_id in empty_slot_map:
                selected_slot = empty_slot_map[candidate_id]
                break

        # Fallback to any remaining empty slot if candidates are occupied
        if not selected_slot and empty_slots:
            selected_slot = empty_slots[0]
            reason_template = "Alokasi dinamis ke slot kosong yang tersedia (kapasitas zona utama penuh)."

        if not selected_slot:
            logger.warning(f"[Storage Allocator] Full storage! No slots available for lot {record.lot_id}.")
            return None

        # Execute assignment
        now = datetime.utcnow()
        selected_slot.lot_id = record.lot_id
        selected_slot.assigned_at = now
        selected_slot.assigned_by = "AI Auto-Assign"

        record.storage_slot = selected_slot.slot_id
        record.storage_zone = selected_slot.zone
        record.stored_at = now

        db.commit()
        db.refresh(selected_slot)
        db.refresh(record)

        assignment_result = {
            "lot_id": record.lot_id,
            "slot_id": selected_slot.slot_id,
            "zone": selected_slot.zone,
            "recommendation_reason": reason_template,
            "stored_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "assigned_by": "AI Auto-Assign",
        }

        logger.info(f"[Storage Allocator] Successfully assigned {record.lot_id} -> Slot {selected_slot.slot_id} ({selected_slot.zone})")

        # Broadcast WebSocket event
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(
                    ws_manager.broadcast_json({
                        "event": "STORAGE_AUTO_ASSIGNED",
                        "data": assignment_result
                    })
                )
        except Exception as e:
            logger.debug(f"[Storage Allocator] WebSocket broadcast skipped: {e}")

        return assignment_result
