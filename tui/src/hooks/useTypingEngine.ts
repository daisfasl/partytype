import { useEffect, useState } from "react";
import { Status } from "../types.js";
import { useInput } from "ink";

// Below this elapsed time, correctChars/5/minutesElapsed blows up toward
// infinity for a fraction of a second right as typing starts (e.g. 1 correct
// char after 20ms elapsed is ~2400wpm). Hold wpm at 0 until enough time has
// passed for the number to mean anything.
const MIN_ELAPSED_MINUTES_FOR_WPM = 1 / 60; // 1 second

export default function useTypingEngine(text: string, durationMs?: number) {
  const [status, setStatus] = useState<Status>("idle");
  const [typed, setTyped] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const restart = () => {
    setTyped("");
    setStatus("idle");
    setStartTime(null);
    setEndTime(null);
  };

  // Solo "time" mode has no natural end point in the text itself (the prompt
  // just keeps extending as the player catches up), so it ends on a wall
  // clock timer from first keystroke instead.
  useEffect(() => {
    if (!durationMs || status !== "typing" || startTime === null) return;
    const remaining = durationMs - (Date.now() - startTime);
    const timer = setTimeout(
      () => {
        setStatus("completed");
        setEndTime(Date.now());
      },
      Math.max(remaining, 0),
    );
    return () => clearTimeout(timer);
  }, [durationMs, status, startTime]);

  // Ticks while typing so wpm/accuracy update live between keystrokes too,
  // not just when a new character triggers a render.
  useEffect(() => {
    if (status !== "typing") return;
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [status]);

  useInput((input, key) => {
    if (status === "completed" || status === "paused") return;

    if (key.tab || key.escape) {
      if (status === "typing") {
        setStatus("paused");
      }
      return;
    }

    if (key.return) {
      return;
    }

    if (key.backspace || key.delete) {
      if (typed.length > 0) {
        setTyped((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (typed.length >= text.length) {
      return;
    }

    if (input.length === 1) {
      setTyped((prev) => prev + input);
      if (status === "idle") {
        setStatus("typing");
        setStartTime(Date.now());
      }
    }

    if (typed.length + 1 === text.length) {
      setStatus("completed");
      setEndTime(Date.now());
    }
  });

  let wpm = 0;
  let accuracy = 0;

  const correctChars = typed
    .split("")
    .filter((char, index) => char === text[index]).length;

  if (startTime) {
    const currentTime = endTime || now;
    const minutesElapsed = (currentTime - startTime) / 60000;

    if (minutesElapsed >= MIN_ELAPSED_MINUTES_FOR_WPM) {
      wpm = Math.round(correctChars / 5 / minutesElapsed);
    }

    if (typed.length > 0) {
      accuracy = Math.round((correctChars / typed.length) * 100);
    }
  }

  return { status, typed, restart, wpm, accuracy, correctChars, startTime };
}
