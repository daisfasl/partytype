import { Box, useInput } from "ink";
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
  const { status, typed, restart, wpm, accuracy } = useTypingEngine(prompt);

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
    // "time" mode has no duration setting in solo Practice yet, so it has
    // no natural completion point - this only ever fires for words/quote.
    if (settings.mode === "words") {
      recordResult("words", settings.numWords, wpm, accuracy);
    } else if (settings.mode === "quote") {
      recordResult("quote", null, wpm, accuracy);
    }
  }, [status, settings.mode, settings.numWords, wpm, accuracy]);

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
