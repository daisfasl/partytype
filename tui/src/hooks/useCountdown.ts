import { useEffect, useState } from "react";

interface UseCountdownArgs {
  durationMs: number | undefined;
  startTime: number | null;
  isDone: boolean;
}

// Shared "time" mode clock
export default function useCountdown({
  durationMs,
  startTime,
  isDone,
}: UseCountdownArgs): number | null {
  const [, forceTick] = useState(0);
  const ticking = Boolean(durationMs) && startTime !== null && !isDone;

  useEffect(() => {
    if (!ticking) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [ticking]);

  if (!durationMs) return null;
  if (startTime === null) return Math.ceil(durationMs / 1000);

  const elapsedMs = isDone ? durationMs : Date.now() - startTime;
  return Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
}
