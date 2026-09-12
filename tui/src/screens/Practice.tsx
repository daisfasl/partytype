import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import PracticeControls from "../components/practice/PracticeControls.js";
import PracticeStats from "../components/practice/PracticeStats.js";
import PracticeText from "../components/practice/PracticeText.js";
import { recordResult } from "../db/stats.js";
import usePracticePrompt from "../hooks/usePracticePrompt.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import type { PracticeSettings, Screen } from "../types.js";
import type { ApiStatus } from "../types.js";
import Gradient from "ink-gradient";

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 60) return String(totalSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface PracticeProps {
  onNavigate: (screen: Screen) => void;
  settings: PracticeSettings;
  apiStatus: ApiStatus;
}

export default function Practice({
  onNavigate,
  settings,
  apiStatus,
}: PracticeProps) {
  const [showStats, setShowStats] = useState(false);
  const { prompt, fetchPrompt, extendIfNeeded } = usePracticePrompt(settings);
  const durationMs =
    settings.mode === "time" ? settings.timeSeconds * 1000 : undefined;
  const { status, typed, restart, wpm, accuracy, startTime } = useTypingEngine(
    prompt,
    durationMs,
  );

  const [, forceTick] = useState(0);
  useEffect(() => {
    if (settings.mode !== "time" || status !== "typing") return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [settings.mode, status]);

  let remainingSeconds = settings.timeSeconds;
  if (settings.mode === "time" && startTime !== null && durationMs) {
    const elapsedMs =
      status === "completed" ? durationMs : Date.now() - startTime;
    remainingSeconds = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
  }

  const restartPractice = () => {
    setShowStats(false);
    restart();
    fetchPrompt();
  };

  useEffect(() => {
    extendIfNeeded(typed.length);
  }, [typed, extendIfNeeded]);

  useEffect(() => {
    if (status !== "completed") return;
    if (settings.mode === "words") {
      recordResult("words", settings.numWords, wpm, accuracy);
    } else if (settings.mode === "time") {
      recordResult("time", settings.timeSeconds, wpm, accuracy);
    } else if (settings.mode === "quote") {
      recordResult("quote", null, wpm, accuracy);
    }
  }, [
    status,
    settings.mode,
    settings.numWords,
    settings.timeSeconds,
    wpm,
    accuracy,
  ]);

  useInput((_input, key) => {
    if (key.escape) {
      onNavigate("home");
    }
    if (key.tab) {
      setShowStats(true);
    }
  });

  const shouldShowStats = showStats || status === "completed";

  return (
    <Box flexDirection="column" padding={1} width="100%" height="100%">
      <Header subtitle="Practice Mode" />
      <Box flexGrow={1} flexDirection="column" justifyContent="center">
        {settings.mode === "time" && (
          <Box width={60} alignSelf="center">
            <Gradient name="pastel">
              <Text>Time: {formatTime(remainingSeconds)}</Text>
            </Gradient>
          </Box>
        )}
        <PracticeText prompt={prompt} typed={typed} />
        {shouldShowStats && (
          <PracticeStats status={status} wpm={wpm} accuracy={accuracy} />
        )}
        {status !== "typing" && (
          <PracticeControls
            onRestart={restartPractice}
            onSettings={() => onNavigate("settings")}
            onExit={() => onNavigate("home")}
          />
        )}
      </Box>
      <Footer
        apiStatus={apiStatus}
        helpText="[←→] select · [enter] open · [esc] quit"
      />
    </Box>
  );
}
