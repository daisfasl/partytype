import { useEffect, useState } from "react";
import { Status } from "../types.js";
import { useInput } from "ink";

export default function useTypingEngine(
  text: string,
  timeLimitSeconds?: number,
) {
  const [status, setStatus] = useState<Status>("idle");
  const [typed, setTyped] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds ?? 0);

  const restart = () => {
    setTyped("");
    setStatus("idle");
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(timeLimitSeconds ?? 0);
  };

  useEffect(() => {
    if (!timeLimitSeconds || status !== "typing") {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) {
          setStatus("completed");
          setEndTime(Date.now());
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLimitSeconds]);

  useEffect(() => {
    setTimeLeft(timeLimitSeconds ?? 0);
  }, [timeLimitSeconds]);

  useInput((input, key) => {
    if (status === "completed") return;

    if (key.tab || key.escape) {
      setStatus("idle");
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

    if (timeLimitSeconds && timeLeft <= 0) {
      return;
    }

    if (!timeLimitSeconds && typed.length >= text.length) {
      return;
    }

    if (input.length === 1) {
      setTyped((prev) => prev + input);
      if (status === "idle") {
        setStatus("typing");
        setStartTime(Date.now());
        if (timeLimitSeconds) {
          setTimeLeft(timeLimitSeconds);
        }
      }
    }

    if (!timeLimitSeconds && typed.length + 1 === text.length) {
      setStatus("completed");
      setEndTime(Date.now());
    }
  });

  let wpm = 0;
  let accuracy = 0;

  if (startTime) {
    const currentTime = endTime || Date.now();
    const minutesElapsed = (currentTime - startTime) / 60000;

    const correctChars = typed
      .split("")
      .filter((char, index) => char === text[index]).length;

    if (minutesElapsed > 0) {
      wpm = Math.round(correctChars / 5 / minutesElapsed);
    }

    if (typed.length > 0) {
      accuracy = Math.round((correctChars / typed.length) * 100);
    }
  }

  return { status, typed, restart, wpm, accuracy, timeLeft };
}
