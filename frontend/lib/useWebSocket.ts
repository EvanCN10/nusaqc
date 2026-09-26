// frontend/lib/useWebSocket.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { InspectionResult } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/events";

export function useInspectionWebSocket(onNewInspection?: (data: InspectionResult) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(onNewInspection);

  useEffect(() => {
    callbackRef.current = onNewInspection;
  }, [onNewInspection]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: NodeJS.Timeout | undefined;
    let isDisposed = false;

    function connect() {
      if (isDisposed) return;
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          if (!isDisposed) setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if ((payload.event === "NEW_INSPECTION" || payload.type === "NEW_INSPECTION") && callbackRef.current) {
              callbackRef.current(payload.data);
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message", e);
          }
        };

        ws.onerror = () => {
          if (!isDisposed) setIsConnected(false);
        };

        ws.onclose = () => {
          if (!isDisposed) {
            setIsConnected(false);
            timer = setTimeout(connect, 3000);
          }
        };
      } catch {
        if (!isDisposed) {
          setIsConnected(false);
          timer = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isDisposed = true;
      clearTimeout(timer);
      if (ws) ws.close();
    };
  }, []);

  return { isConnected };
}