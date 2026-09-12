import { useCallback, useEffect, useState } from "react";
import { generateMoreWords, generateText } from "../db/textGeneration.js";
import type { PracticeSettings } from "../types.js";

const INITIAL_TIME_CHUNK = 250;
const TIME_EXTEND_CHUNK = 250;
const TIME_EXTEND_THRESHOLD = 250;

export default function usePracticePrompt(settings: PracticeSettings) {
  const [prompt, setPrompt] = useState("");

  const fetchPrompt = useCallback(() => {
    if (settings.mode === "quote") {
      setPrompt(generateText("quote", 0, settings.language));
    } else if (settings.mode === "time") {
      setPrompt(generateText("time", INITIAL_TIME_CHUNK, settings.language));
    } else {
      setPrompt(generateText("words", settings.numWords, settings.language));
    }
  }, [settings.mode, settings.numWords, settings.language]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  // Only meaningful in "time" mode - appends more words once the player is
  // within TIME_EXTEND_THRESHOLD chars of running out of text.
  const extendIfNeeded = useCallback(
    (typedLength: number) => {
      if (settings.mode !== "time") return;
      setPrompt((current) => {
        if (current.length - typedLength > TIME_EXTEND_THRESHOLD) {
          return current;
        }
        return `${current} ${generateMoreWords(TIME_EXTEND_CHUNK, settings.language)}`;
      });
    },
    [settings.mode, settings.language],
  );

  return { prompt, fetchPrompt, extendIfNeeded };
}
