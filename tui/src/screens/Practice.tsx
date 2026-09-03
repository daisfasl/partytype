import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import PracticeControls from "../components/practice/PracticeControls.js";
import PracticeStats from "../components/practice/PracticeStats.js";
import PracticeText from "../components/practice/PracticeText.js";
import usePracticePrompt from "../hooks/usePracticePrompt.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import type { ApiStatus, PracticeSettings, Screen } from "../types.js";

interface PracticeProps {
  onNavigate: (screen: Screen) => void;
  settings: PracticeSettings;
  apiStatus: ApiStatus;
  windowSize: { columns: number; rows: number };
}

export default function Practice({
  onNavigate,
  settings,
  apiStatus,
  windowSize,
}: PracticeProps) {
  const [showStats, setShowStats] = useState(false);
  const promptSize = settings.mode === "timed" ? 10 : settings.numWords;
  const { prompt, fetchPrompt, appendPrompt } = usePracticePrompt(promptSize);
  const { status, typed, restart, wpm, accuracy, timeLeft } = useTypingEngine(
    prompt,
    settings.mode === "timed" ? settings.timeLimit : undefined,
  );

  const isTimedMode = settings.mode === "timed";
  const visibleWidth = Math.max(
    20,
    Math.min(windowSize.columns - 4, windowSize.columns),
  );
  const appendThreshold = Math.max(30, Math.floor(visibleWidth * 0.8));

  useEffect(() => {
    fetchPrompt();
    restart();
  }, [fetchPrompt, settings.mode, settings.numWords, settings.timeLimit]);

  useEffect(() => {
    if (
      isTimedMode &&
      status === "typing" &&
      prompt.length > 0 &&
      timeLeft > 0 &&
      typed.length >= Math.max(0, prompt.length - appendThreshold)
    ) {
      appendPrompt();
    }
  }, [
    appendPrompt,
    appendThreshold,
    isTimedMode,
    prompt.length,
    status,
    timeLeft,
    typed.length,
  ]);

  const restartPractice = () => {
    setShowStats(false);
    restart();
    fetchPrompt();
  };

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
    <Box flexDirection="column" padding={1} height={windowSize.rows}>
      <Header
        subtitle={
          isTimedMode ? `Timed ${settings.timeLimit}s` : "Practice Mode"
        }
      />
      <Box flexGrow={1} flexDirection="column" justifyContent="center">
        {isTimedMode && (
          <Box marginBottom={1}>
            <Text color="cyan">Time: {timeLeft}s</Text>
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
