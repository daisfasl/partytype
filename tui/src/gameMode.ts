export type Mode = "words" | "time" | "quote";

// Mirrors backend/app/game/constants.py's GRACE_PERIOD_SECONDS - how long the
// server waits after the first player finishes before ending the race for
// everyone. No shared codegen between backend and TUI, so keep this in sync
// by hand (same pattern as textGeneration.ts's TIME_MODE_WORD_BUFFER).
export const GRACE_PERIOD_SECONDS = 15;

export function getModeSettingValue(
  mode: Mode,
  wordCount: number,
  timeSeconds: number,
): number | null {
  if (mode === "words") return wordCount;
  if (mode === "time") return timeSeconds;
  return null;
}

export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 60) return String(totalSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
