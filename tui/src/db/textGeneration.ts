import getDb from "./index.js";

// Comfortably covers the full 300s multiplayer time cap at well beyond
// realistic WPM (see ROADMAP Phase C) — reused by the host when starting a
// multiplayer "time" mode race.
export const TIME_MODE_WORD_BUFFER = 1200;

type Mode = "words" | "time" | "quote";

function randomWords(count: number): string[] {
  const db = getDb();
  const rows = db
    .query("SELECT word FROM words ORDER BY RANDOM() LIMIT ?")
    .all(count) as { word: string }[];
  return rows.map((row) => row.word);
}

function randomQuote(): string {
  const db = getDb();
  const row = db
    .query("SELECT content FROM quotes ORDER BY RANDOM() LIMIT 1")
    .get() as { content: string } | null;
  return row?.content ?? "";
}

export function generateText(mode: Mode, count: number): string {
  // "words" and "time" both resolve to N random words joined - the caller
  // decides what N means (a word-count setting, an initial local chunk for
  // solo endless mode, or TIME_MODE_WORD_BUFFER for multiplayer).
  if (mode === "quote") return randomQuote();
  return randomWords(count).join(" ");
}

export function generateMoreWords(n: number): string {
  return randomWords(n).join(" ");
}
