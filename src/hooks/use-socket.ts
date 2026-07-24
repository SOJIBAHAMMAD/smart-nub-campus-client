"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { SocketEvents, ServerEvents } from "@/lib/types/socket-events";
import { env } from "@/env";

interface UseSocketOptions {
  /** Socket.IO server URL. Defaults to NEXT_PUBLIC_API_URL. */
  url?: string;
  /** Session token for authentication (Better Auth cookie is preferred). */
  token?: string;
  /** Whether to auto-connect on mount. Defaults to true. */
  autoConnect?: boolean;
}

interface UseSocketReturn {
  /** The underlying Socket.IO client instance. Null until connected. */
  socket: Socket | null;
  /** Whether the socket is currently connected. */
  isConnected: boolean;
  /** Current connection status. */
  status: "connecting" | "connected" | "disconnected" | "error";
  /** Manually connect the socket. */
  connect: () => void;
  /** Manually disconnect the socket. */
  disconnect: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Initializes and manages a Socket.IO client connection with
 * authentication, reconnection, and event subscription.
 *
 * @example
 * ```tsx
 * const { socket, isConnected } = useSocket({ token: sessionToken });
 *
 * useSocketEvent(socket, "messaging:new", (msg) => {
 *   setMessages((prev) => [...prev, msg]);
 * });
 * ```
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    url = env.NEXT_PUBLIC_BACKEND_URL,
    token,
    autoConnect = true,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<UseSocketReturn["status"]>(
    autoConnect ? "connecting" : "disconnected",
  );

  // Use a ref to track whether we've already connected in this component lifecycle
  const connectedRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (connectedRef.current) return;
    connectedRef.current = true;

    const socketInstance = io(url, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000, // Initial delay: 1s
      reconnectionDelayMax: 30000, // Max delay: 30s
      randomizationFactor: 0.5, // Jitter: 0-1s
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setStatus("connected");
    });

    socketInstance.on("disconnect", (_reason) => {
      setIsConnected(false);
      setStatus("disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      setStatus("error");
      console.error("[Socket] Connection error:", err.message);
    });

    socketInstance.on("reconnect_attempt", (_attempt) => {
      setStatus("connecting");
    });

    socketInstance.on("reconnect", () => {
      setIsConnected(true);
      setStatus("connected");
    });

    // ── Presence heartbeat ────────────────────────────────────────────────
    // Keep the user's presence alive on the server. The server marks users
    // offline after 30 s without a heartbeat, so we emit every 20 s.
    heartbeatRef.current = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit("presence:heartbeat");
      }
    }, 20_000);

    socketInstance.on("disconnect", () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    });

    setSocket(socketInstance);
  }, [url, token]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    setSocket(null);
    setIsConnected(false);
    setStatus("disconnected");
    connectedRef.current = false;
  }, [socket]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      socket?.disconnect();
      setSocket(null);
      connectedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, url, token]);

  return {
    socket,
    isConnected,
    status,
    connect,
    disconnect,
  };
}

// ---------------------------------------------------------------------------
// Event subscription hook
// ---------------------------------------------------------------------------

/**
 * Subscribe to a Socket.IO server event. Automatically cleans up on unmount.
 *
 * @param socket - The Socket.IO client instance from `useSocket`.
 * @param event - The event name to listen for.
 * @param handler - The callback invoked when the event fires.
 */
export function useSocketEvent<E extends ServerEvents>(
  socket: Socket | null,
  event: E,
  handler: (data: SocketEvents[E]) => void,
): void {
  const handlerRef = useRef(handler);

  // Keep the handler ref up to date via effect, not during render
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!socket) return;

    const listener = (data: SocketEvents[E]) => {
      handlerRef.current(data);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event as any, listener);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event as any, listener);
    };
  }, [socket, event]);
}
