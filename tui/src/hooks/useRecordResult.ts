import { useEffect } from "react";
import { recordResult } from "../db/stats.js";
import type { Mode } from "../gameMode.js";

interface UseRecordResultArgs {
  shouldRecord: boolean;
  mode: Mode;
  settingValue: number | null;
  wpm: number;
  accuracy: number;
}

export default function useRecordResult({
  shouldRecord,
  mode,
  settingValue,
  wpm,
  accuracy,
}: UseRecordResultArgs): void {
  useEffect(() => {
    if (!shouldRecord) return;
    recordResult(mode, settingValue, wpm, accuracy);
  }, [shouldRecord]);
}
