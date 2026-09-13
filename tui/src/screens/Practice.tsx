import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import PracticeControls from "../components/practice/PracticeControls.js";
import PracticeStats from "../components/practice/PracticeStats.js";
import PracticeText from "../components/practice/PracticeText.js";
import { formatTime, getModeSettingValue } from "../gameMode.js";
import useCountdown from "../hooks/useCountdown.js";
import usePracticePrompt from "../hooks/usePracticePrompt.js";
import useRecordResult from "../hooks/useRecordResult.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import type { PracticeSettings, Screen } from "../types.js";
import type { ApiStatus } from "../types.js";
import Gradient from "ink-gradient";

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
  const { prompt, quoteSource, fetchPrompt, extendIfNeeded } =
    usePracticePrompt(settings);
  const durationMs =
    settings.mode === "time" ? settings.timeSeconds * 1000 : undefined;
  const { status, typed, restart, wpm, accuracy, startTime } = useTypingEngine(
    prompt,
    durationMs,
  );

  const remainingSecondsOrNull = useCountdown({
    durationMs,
    startTime,
    isDone: status === "completed",
  });
  const remainingSeconds = remainingSecondsOrNull ?? settings.timeSeconds;

  const restartPractice = () => {
    setShowStats(false);
    restart();
    fetchPrompt();
  };

  useEffect(() => {
    extendIfNeeded(typed.length);
  }, [typed, extendIfNeeded]);

  useRecordResult({
    shouldRecord: status === "completed",
    mode: settings.mode,
    settingValue: getModeSettingValue(
      settings.mode,
      settings.numWords,
      settings.timeSeconds,
    ),
    wpm,
    accuracy,
  });

  useInput((_input, key) => {
    if (key.escape) {
      onNavigate("home");
    }
    if (key.tab && status === "typing") {
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
        {settings.mode === "quote" && quoteSource && (
          <Box width={60} alignSelf="center">
            <Gradient name="pastel">
              <Text dimColor>Source: {quoteSource}</Text>
            </Gradient>
          </Box>
        )}
        <PracticeText
          prompt={prompt}
          typed={typed}
          visibleLines={settings.mode === "time" ? 4 : undefined}
        />
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
        helpText="[tab] pause · [←→] select · [enter] open · [esc] quit"
      />
    </Box>
  );
}
