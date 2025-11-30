import { useEffect, useRef } from "react";

export function useBoardWebSocket(boardId, onMessage) {
    const wsRef = useRef(null);

    useEffect(() => {
        if (!boardId) {
            return;
        }

        // Derive WebSocket URL from API URL
        const apiUrl = import.meta.env.VITE_API_URL;
        const wsBase = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        const wsUrl = `${wsBase}/ws/board/${boardId}/`;
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            // WebSocket connected
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.onclose = () => {
            // WebSocket disconnected
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;

        // cleanup on unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [boardId]); // Remove onMessage from dependencies

    return wsRef;
}