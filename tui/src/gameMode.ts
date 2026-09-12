export type Mode = "words" | "time" | "quote";

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
