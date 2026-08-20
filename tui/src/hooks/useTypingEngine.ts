import { useState } from "react";
import { Status } from "../types.js";
import { useInput } from "ink";

export default function useTypingEngine(text: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [typed, setTyped] = useState<string>("");

  useInput((input, key) => {
    if (status === "completed") return;
    if (key.tab || key.escape) {
      setStatus("idle");
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
      if (status === "idle") setStatus("typing");
    }

    if (typed.length + 1 === text.length) {
      setStatus("completed");
    }
  });

  return { status, typed };
}
