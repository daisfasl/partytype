import { Box, useInput } from "ink";
import { useState } from "react";
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
  const { prompt, fetchPrompt } = usePracticePrompt(settings.numWords);
  const { status, typed, restart, wpm, accuracy } = useTypingEngine(prompt);

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
      <Header subtitle="Practice Mode" />
      <Box flexGrow={1} flexDirection="column" justifyContent="center">
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
