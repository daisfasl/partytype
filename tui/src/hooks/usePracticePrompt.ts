import { useCallback, useEffect, useState } from "react";
import {
  generateMoreWords,
  generateText,
  getRandomQuoteWithSource,
} from "../db/textGeneration.js";
import type { PracticeSettings } from "../types.js";

const INITIAL_TIME_CHUNK = 250;
const TIME_EXTEND_CHUNK = 250;
const TIME_EXTEND_THRESHOLD = 250;

export default function usePracticePrompt(settings: PracticeSettings) {
  const [prompt, setPrompt] = useState("");
  const [quoteSource, setQuoteSource] = useState<string | null>(null);

  const fetchPrompt = useCallback(() => {
    if (settings.mode === "quote") {
      const { text, source } = getRandomQuoteWithSource(
        settings.language,
        settings.quoteLength,
      );
      setPrompt(text);
      setQuoteSource(source);
    } else if (settings.mode === "time") {
      setPrompt(generateText("time", INITIAL_TIME_CHUNK, settings.language));
      setQuoteSource(null);
    } else {
      setPrompt(generateText("words", settings.numWords, settings.language));
      setQuoteSource(null);
    }
  }, [settings.mode, settings.numWords, settings.language, settings.quoteLength]);

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

  return { prompt, quoteSource, fetchPrompt, extendIfNeeded };
}
