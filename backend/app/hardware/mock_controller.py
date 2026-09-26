import time
from typing import Dict, Any
from app.hardware.controller import BaseHardwareController

# TODO: Check if this mock controller have the functions align with the made schemas in hardware.py


class MockHardwareController(BaseHardwareController):
    """
    Simulated Hardware Controller for local laptop development, Docker containers,
    and COMPFEST judge evaluation without physical Raspberry Pi GPIO pins.
    """

import time
import os
import urllib.request
import threading
from typing import Dict, Any
from app.hardware.controller import BaseHardwareController


class MockHardwareController(BaseHardwareController):
    """
    Hardware Controller for Central Backend:
    Manages internal status and asynchronously forwards actuation commands
    to the physical Raspberry Pi 4 Edge Node (if available).
    """

    def __init__(self):
        self.conveyor_status = "ACTIVE"
        self.tower_light = "GREEN"
        self.buzzer = "OFF"
        self.camera_status = "ONLINE"
        self.edge_url = os.environ.get("EDGE_NODE_URL", "http://192.168.137.251:8080")
        print(f"🛠️ [HARDWARE] Controller initialized. Edge node target: {self.edge_url}")

    def _notify_edge(self, signal: str):
        """Asynchronously dispatches actuation signal to Raspberry Pi edge node."""
        def _worker():
            try:
                url = f"{self.edge_url}/actuate?signal={signal}"
                req = urllib.request.Request(url, headers={"User-Agent": "NusaQC-Central"})
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    pass
            except Exception:
                pass
        t = threading.Thread(target=_worker, daemon=True)
        t.start()

    def trigger_signal(self, signal: str) -> Dict[str, Any]:
        signal = signal.upper()
        
        if signal in ["PASS", "GREEN"]:
            self.conveyor_status = "ACTIVE"
            self.tower_light = "GREEN"
            self.buzzer = "OFF"
            log_badge = "\033[92m[SIGNAL: GREEN]\033[0m"
            action_desc = "Conveyor Running (Normal Speed) | Buzzer OFF"

        elif signal in ["CONDITIONAL", "YELLOW"]:
            self.conveyor_status = "ACTIVE"
            self.tower_light = "YELLOW"
            self.buzzer = "ACTIVE"
            log_badge = "\033[93m[SIGNAL: YELLOW]\033[0m"
            action_desc = "Conveyor Running | Yellow Indicator ON | Short Beep (Secondary Check)"

        elif signal in ["FAIL", "RED"]:
            self.conveyor_status = "STOPPED"
            self.tower_light = "RED"
            self.buzzer = "ACTIVE"
            log_badge = "\033[91m[SIGNAL: RED]\033[0m"
            action_desc = "RELAY TRIGGERED -> Conveyor Motor STOPPED | Continuous Alarm ON"

        else:
            log_badge = "[SIGNAL: UNKNOWN]"
            action_desc = "No state change."

        print(f"🏭 [HARDWARE] {log_badge} {action_desc}")
        
        # Forward physical actuation to Raspberry Pi edge node
        self._notify_edge(signal)

        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "camera": self.camera_status,
            "conveyor_relay": self.conveyor_status,
            "tower_light": self.tower_light,
            "buzzer": self.buzzer,
            "mock_mode": True
        }

    def test_connection(self, ip_address: str) -> Dict[str, Any]:
        """Tests live connectivity to Raspberry Pi edge node."""
        target = ip_address.strip()
        if not target.startswith("http://") and not target.startswith("https://"):
            if ":" not in target:
                target = f"http://{target}:8080"
            else:
                target = f"http://{target}"

        t_start = time.time()
        try:
            req = urllib.request.Request(f"{target}/health", headers={"User-Agent": "NusaQC-Central"})
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                if resp.status == 200:
                    latency = max(1, int((time.time() - t_start) * 1000))
                    return {
                        "success": True,
                        "message": f"Berhasil terhubung ke Edge Node ({target})",
                        "latency_ms": latency
                    }
        except Exception as e:
            # Check basic connection error
            return {
                "success": False,
                "message": f"Tidak dapat terhubung ke {target}: {e}",
                "latency_ms": None
            }

        return {
            "success": False,
            "message": f"Edge node pada {target} tidak merespons",
            "latency_ms": None
        }

    def cleanup(self) -> None:
        print("🛑 [HARDWARE] Cleanup completed. Signals reset.")