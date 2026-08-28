import { Box, useInput, useStdout } from "ink";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import PracticeControls from "../components/practice/PracticeControls.js";
import PracticeStats from "../components/practice/PracticeStats.js";
import PracticeText from "../components/practice/PracticeText.js";
import usePracticePrompt from "../hooks/usePracticePrompt.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import type { PracticeSettings, Screen } from "../types.js";

interface PracticeProps {
  onNavigate: (screen: Screen) => void;
  settings: PracticeSettings;
}

export default function Practice({ onNavigate, settings }: PracticeProps) {
  const { stdout } = useStdout();
  const { prompt, fetchPrompt } = usePracticePrompt(settings.numWords);
  const { status, typed, restart, wpm, accuracy } = useTypingEngine(prompt);

  const restartPractice = () => {
    restart();
    fetchPrompt();
  };

  useInput((_input, key) => {
    if (key.escape) {
      onNavigate("home");
    }
  });

  return (
    <Box flexDirection="column" padding={1} height={stdout.rows}>
      <Header subtitle="Practice Mode" />
      <Box flexGrow={1} flexDirection="column" justifyContent="center">
        <PracticeText prompt={prompt} typed={typed} />
        <PracticeStats status={status} wpm={wpm} accuracy={accuracy} />
        {status !== "typing" && (
          <PracticeControls
            onRestart={restartPractice}
            onSettings={() => onNavigate("settings")}
            onExit={() => onNavigate("home")}
          />
        )}
      </Box>
    </Box>
  );
}
