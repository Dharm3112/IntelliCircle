"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

interface SocketState {
    connected: boolean;
    connecting: boolean;
    error: string | null;
}

export function useSocket() {
    const { isAuthenticated, accessToken, logout } = useAuthStore();
    const [socketState, setSocketState] = useState<SocketState>({
        connected: false,
        connecting: false,
        error: null,
    });

    // Store active connection reference
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCount = useRef(0);
    const maxRetries = 10;

    // Callbacks provided by individual Chat Room components
    const messageHandlers = useRef<((data: any) => void)[]>([]);

    const connect = useCallback(() => {
        if (!accessToken) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setSocketState(prev => ({ ...prev, connecting: true, error: null }));

        // Pass JWT over standard WSS URI since standard `new WebSocket` does not support custom headers
        const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:8080"}/ws?token=${accessToken}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected.");
            setSocketState({ connected: true, connecting: false, error: null });
            reconnectCount.current = 0; // Reset backoff
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // If the server rejected auth natively
                if (data.type === 'error' && data.message.includes('token')) {
                    ws.close();
                    logout(); // Force them out of the app
                    return;
                }

                // Broadcast to all active UI listeners
                messageHandlers.current.forEach(handler => handler(data));
            } catch (e) {
                console.error("Failed to parse WS message", event.data);
            }
        };

        ws.onclose = (event) => {
            console.log(`WebSocket disconnected [Code: ${event.code}].`);
            setSocketState({ connected: false, connecting: false, error: "Connection lost." });
            wsRef.current = null;

            // Attempt Exponential Backoff Reconnection (unless unauthorized 1008)
            if (event.code !== 1008 && reconnectCount.current < maxRetries) {
                const timeout = Math.min(1000 * (2 ** reconnectCount.current), 30000);
                console.log(`Attempting reconnect in ${timeout}ms...`);

                setTimeout(() => {
                    reconnectCount.current += 1;
                    connect();
                }, timeout);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error", error);
            // onclose will fire immediately after handling state
        };

        wsRef.current = ws;

    }, [accessToken, logout]);

    // Global Lifecycle
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            connect();
        } else if (wsRef.current) {
            // Drop connection on logout
            wsRef.current.close(1000, "User logged out");
            wsRef.current = null;
        }

        return () => {
            // Cleanup on unmount
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isAuthenticated, accessToken, connect]);

    const subscribe = useCallback((handler: (data: any) => void) => {
        messageHandlers.current.push(handler);
        return () => {
            // Unsubscribe cleanup
            messageHandlers.current = messageHandlers.current.filter(h => h !== handler);
        };
    }, []);

    const sendMessage = useCallback((type: string, payload: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }));
            return true;
        }
        return false;
    }, []);

    return {
        ...socketState,
        subscribe,
        sendMessage
    };
}
