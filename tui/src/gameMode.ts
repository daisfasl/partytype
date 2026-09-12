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
