from typing import List
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket client connections for real-time event broadcasting."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"📡 [WEBSOCKET] Client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"📡 [WEBSOCKET] Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast_json(self, data: dict):
        """Broadcasts JSON payload to all connected frontend clients."""
        dead: List[WebSocket] = []
        for connection in list(self.active_connections):  # snapshot prevents concurrent-modification
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"⚠️ [WEBSOCKET] Broadcast error, dropping client: {e}")
                dead.append(connection)
        for conn in dead:
            self.disconnect(conn)

ws_manager = ConnectionManager()