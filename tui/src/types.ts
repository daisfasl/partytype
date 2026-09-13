export type Screen =
  | "home"
  | "practice"
  | "create-party"
  | "join-party"
  | "lobby"
  | "race"
  | "settings"
  | "language-select"
  | "stats";

export type Status = "idle" | "typing" | "paused" | "completed";

export type PracticeSettings = {
  numWords: number;
  timeSeconds: number;
  mode: "words" | "time" | "quote";
  language: string;
  quoteLength: QuoteLength;
};

export type ApiStatus = "loading" | "online" | "offline";

// ---------------------------------------------------------------------------
// WebSocket protocol — hand-mirrored from backend/app/schemas/payloads.py.
// There is no shared codegen between the backend and the TUI, so keep these
// in sync by hand whenever payloads.py changes. Field names are verbatim
// snake_case to match the wire format exactly (no camelCase conversion).
// ---------------------------------------------------------------------------

export type GameMode = "time" | "words" | "quote";
export type RoomStatus = "waiting" | "countdown" | "active" | "completed";
// MonkeyType's own 4-tier quote-length convention - see db/textGeneration.ts
// for the bucketing logic against each language's own `groups` ranges.
export type QuoteLength = "short" | "medium" | "long" | "extreme";

export interface Player {
  cursor: number;
  completed_words: number;
  wpm: number;
  correct_chars: number;
  accuracy: number;
  finished: boolean;
}

// Players -> Server
export interface ProgressPayload {
  type: "progress";
  cursor: number;
  completed_words: number;
  correct_chars: number;
}

export interface StartPayload {
  type: "start";
  text: string;
  quote_source?: string; // only meaningful in "quote" mode
}

export interface FinishPayload {
  type: "finish";
}

export interface UpdateSettingsPayload {
  type: "settings";
  mode: GameMode;
  time_setting: number; // 15-300 seconds, only meaningful in "time" mode
  word_count: number; // 10-200, only meaningful in "words" mode
  language: string;
  quote_length: QuoteLength; // only meaningful in "quote" mode
}

// Server -> Players
export interface RoomPayload {
  type: "room";
  room: string; // the room code
  mode: GameMode;
  status: RoomStatus;
  time_setting: number;
  word_count: number;
  language: string;
  quote_length: QuoteLength;
  text: string;
  quote_source: string | null;
  players: Record<string, Player>;
  host: string;
}

export interface CountdownPayload {
  type: "countdown";
  value: 1 | 2 | 3;
}

export interface LeaderboardEntry {
  player_id: string;
  wpm: number;
  accuracy: number;
  rank: number; // 1-indexed; finishers ranked by finish order, then non-finishers by wpm desc
  finished: boolean;
}

export interface GameEndPayload {
  type: "end";
  leaderboard: LeaderboardEntry[];
}

export interface ErrorPayload {
  type: "error";
  message: string;
}

// Bidirectional
export interface MessagePayload {
  type: "message";
  sender: "user" | "server";
  message: string;
}

// Payloads the TUI sends to the server.
export type ClientPayload =
  | ProgressPayload
  | StartPayload
  | FinishPayload
  | UpdateSettingsPayload
  | MessagePayload;

// Payloads the server sends to the TUI.
export type ServerPayload =
  | RoomPayload
  | CountdownPayload
  | GameEndPayload
  | ErrorPayload
  | MessagePayload;

export type Payload = ClientPayload | ServerPayload;
