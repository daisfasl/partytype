// React hook wrapping a single, persistent party WebSocket connection.
//
// IMPORTANT: this must be called once at the top of App.tsx (same level as
// useApiStatus/useTerminalSize) and its return value passed down as props to
// whichever screen is active. Calling it inside an individual screen (e.g.
// Lobby or Race) would tear down and recreate the connection every time
// navigation swaps which component is mounted - the whole point of this
// hook is that CreateParty -> Lobby -> countdown -> Race -> Lobby all share
// the *same* underlying socket.

import { useCallback, useRef, useState } from "react";
import { getBackendUrl } from "../config.js";
import { createPartySocket, joinPartySocket, PartySocket } from "../services/socket.js";
import type { ClientPayload, RoomPayload, ServerPayload } from "../types.js";

export type PartyConnectionStatus =
  | "idle" // no connection attempted yet (or explicitly left)
  | "connecting" // socket opened, waiting on the first server response
  | "connected" // socket open and at least one RoomPayload received
  | "error"; // socket error, or an ErrorPayload was received

/**
 * A single discrete/transient server event, as opposed to `room` (the
 * latest-known state snapshot). Screens should react to these once each -
 * e.g. a Race screen watching for a "countdown" tick, or a Lobby/JoinParty
 * screen surfacing an "error" message. Each event gets a fresh `id` so
 * consumers can key a useEffect off it even if the same payload shape
 * repeats back to back (e.g. two identical countdown values would otherwise
 * be indistinguishable by value alone).
 */
export type PartyEvent =
  | { id: number; kind: "countdown"; value: number }
  | { id: number; kind: "end"; winner: string }
  | { id: number; kind: "error"; message: string }
  | { id: number; kind: "message"; sender: "user" | "server"; message: string };

export interface UseParty {
  /** Current connection lifecycle state. */
  status: PartyConnectionStatus;
  /** Latest known room snapshot, from the most recent RoomPayload. Null until one arrives. */
  room: RoomPayload | null;
  /** The player id this client connected/is connecting with, if any. */
  playerId: string | null;
  /** Most recent transient event (countdown/end/error/message). Null until one arrives. */
  lastEvent: PartyEvent | null;
  /** Opens a connection that creates a brand new room, becoming host. */
  createParty: (playerId: string) => void;
  /** Opens a connection that joins an existing room by code. */
  joinParty: (roomId: string, playerId: string) => void;
  /** Sends a payload over the current connection. No-op if not connected. */
  send: (payload: ClientPayload) => void;
  /** Closes the current connection and resets all state back to idle. */
  leave: () => void;
}

export default function useParty(): UseParty {
  const socketRef = useRef<PartySocket | null>(null);
  const eventIdRef = useRef(0);

  const [status, setStatus] = useState<PartyConnectionStatus>("idle");
  const [room, setRoom] = useState<RoomPayload | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<PartyEvent | null>(null);

  const attach = useCallback((socket: PartySocket, pid: string) => {
    // Tear down whatever connection was previously active. Guard every
    // listener below with `isCurrent()` so a stale event from the socket
    // we're replacing (e.g. its "close" firing after we've already moved
    // on) can't clobber state that belongs to the new connection.
    const previous = socketRef.current;
    socketRef.current = socket;
    previous?.close();

    const isCurrent = () => socketRef.current === socket;

    setPlayerId(pid);
    setStatus("connecting");
    setRoom(null);
    setLastEvent(null);

    socket.on("open", () => {
      if (isCurrent()) setStatus("connected");
    });

    socket.on("error", () => {
      if (isCurrent()) setStatus("error");
    });

    socket.on("close", () => {
      if (!isCurrent()) return;
      setStatus((prev) => (prev === "error" ? prev : "idle"));
    });

    socket.on("message", (payload: ServerPayload) => {
      if (!isCurrent()) return;
      const nextId = () => ++eventIdRef.current;
      switch (payload.type) {
        case "room":
          setStatus("connected");
          setRoom(payload);
          break;
        case "countdown":
          setLastEvent({ id: nextId(), kind: "countdown", value: payload.value });
          break;
        case "end":
          setLastEvent({ id: nextId(), kind: "end", winner: payload.winner });
          break;
        case "error":
          setLastEvent({ id: nextId(), kind: "error", message: payload.message });
          setStatus("error");
          break;
        case "message":
          setLastEvent({
            id: nextId(),
            kind: "message",
            sender: payload.sender,
            message: payload.message,
          });
          break;
      }
    });
  }, []);

  const createParty = useCallback(
    (name: string) => {
      attach(createPartySocket(getBackendUrl(), name), name);
    },
    [attach],
  );

  const joinParty = useCallback(
    (roomId: string, name: string) => {
      attach(joinPartySocket(getBackendUrl(), roomId, name), name);
    },
    [attach],
  );

  const send = useCallback((payload: ClientPayload) => {
    socketRef.current?.send(payload);
  }, []);

  const leave = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setStatus("idle");
    setRoom(null);
    setPlayerId(null);
    setLastEvent(null);
  }, []);

  return { status, room, playerId, lastEvent, createParty, joinParty, send, leave };
}
