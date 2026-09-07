// WebSocket client for the multiplayer party protocol.
//
// Bun ships a native, browser-compatible `WebSocket` global - no `ws`
// package needed. This module wraps it in a small typed event emitter so a
// React hook (see hooks/useParty.ts) can consume it without dealing with the
// raw DOM event API directly.
//
// Wire format: every payload is a raw JSON text frame with no envelope - the
// object itself carries a top-level `type` field used to discriminate it.
// See types.ts for the hand-mirrored payload shapes (kept in sync by hand
// with backend/app/schemas/payloads.py).

import type { ClientPayload, ServerPayload } from "../types.js";

type PartySocketEvents = {
  open: [];
  message: [ServerPayload];
  error: [unknown];
  close: [];
};

type Listener<Args extends unknown[]> = (...args: Args) => void;

/**
 * Thin wrapper around a single WebSocket connection to the party backend.
 * Handles JSON (de)serialization and exposes a plain on/off event API so it
 * can be driven from a React hook (or, for testing, directly from a script)
 * without depending on React at all.
 */
export class PartySocket {
  private ws: WebSocket;
  private listeners: {
    [K in keyof PartySocketEvents]: Listener<PartySocketEvents[K]>[];
  } = {
    open: [],
    message: [],
    error: [],
    close: [],
  };

  constructor(url: string) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.emit("open");

    this.ws.onmessage = (event) => {
      let payload: ServerPayload;
      try {
        payload = JSON.parse(String(event.data)) as ServerPayload;
      } catch (err) {
        this.emit("error", err);
        return;
      }
      this.emit("message", payload);
    };

    this.ws.onerror = (event) => this.emit("error", event);

    this.ws.onclose = () => this.emit("close");
  }

  on<K extends keyof PartySocketEvents>(
    event: K,
    listener: Listener<PartySocketEvents[K]>,
  ): () => void {
    this.listeners[event].push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof PartySocketEvents>(
    event: K,
    listener: Listener<PartySocketEvents[K]>,
  ): void {
    const list = this.listeners[event];
    const index = list.indexOf(listener);
    if (index !== -1) list.splice(index, 1);
  }

  private emit<K extends keyof PartySocketEvents>(
    event: K,
    ...args: PartySocketEvents[K]
  ): void {
    // Copy before iterating - a listener may unsubscribe itself/others.
    for (const listener of [...this.listeners[event]]) listener(...args);
  }

  send(payload: ClientPayload): void {
    this.ws.send(JSON.stringify(payload));
  }

  close(): void {
    this.ws.close();
  }

  get readyState(): number {
    return this.ws.readyState;
  }
}

/**
 * Opens a connection that creates a brand new room. The connecting client
 * becomes host; the server assigns a random 6-char room code, learned only
 * from the first RoomPayload received (not from this URL).
 */
export function createPartySocket(
  backendUrl: string,
  playerId: string,
): PartySocket {
  const url = `${backendUrl}/ws/party/create?player_id=${encodeURIComponent(playerId)}`;
  return new PartySocket(url);
}

/**
 * Opens a connection that joins an existing room by code. Room id and
 * player id are case-sensitive. On failure (room not found, not "waiting",
 * or player_id already taken) the server sends one ErrorPayload and closes
 * the connection - the caller should surface that message and let the user
 * retry rather than auto-retrying.
 */
export function joinPartySocket(
  backendUrl: string,
  roomId: string,
  playerId: string,
): PartySocket {
  const url = `${backendUrl}/ws/party/${encodeURIComponent(roomId)}/${encodeURIComponent(playerId)}`;
  return new PartySocket(url);
}
