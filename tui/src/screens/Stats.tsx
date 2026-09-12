import { Box, Text, useInput } from "ink";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import Menu from "../components/Menu.js";
import ActivityGraph from "../components/ActivityGraph.js";
import useTerminalSize from "../hooks/useTerminalSize.js";
import { getBest } from "../db/stats.js";
import type { ApiStatus, Screen } from "../types.js";

interface StatsProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
}

// Union of the fixed option sets offered in Settings.tsx (solo Practice) and
// Lobby.tsx (multiplayer host controls) - personal bests can come from
// either path, keyed by (mode, settingValue), so both conventions' values
// are worth showing here.
const WORD_COUNT_OPTIONS = [10, 25, 30, 50, 100, 200];
const TIME_SETTING_OPTIONS = [15, 30, 60, 120, 300];

function formatBest(best: { wpm: number; accuracy: number } | null): string {
  return best ? `${best.wpm} wpm · ${best.accuracy}% acc` : "—";
}

export default function Stats({ onNavigate, apiStatus }: StatsProps) {
  useInput((_input, key) => {
    if (key.escape) {
      onNavigate("home");
    }
  });

  const quoteBest = getBest("quote", null);
  const { columns } = useTerminalSize();
  const boxWidth = Math.min(Math.max((columns ?? 80) - 4, 60), 120);

  return (
    <Box width="100%" alignItems="center" justifyContent="center" height="100%">
      <Box flexDirection="column" borderStyle="round" width={boxWidth} paddingX={1}>
        <Header subtitle="Personal Bests" />

        <Box marginTop={1}>
          <ActivityGraph maxWidth={boxWidth - 4} />
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Words:</Text>
          {WORD_COUNT_OPTIONS.map((count) => (
            <Box key={count} width="100%">
              <Box flexGrow={1}>
                <Text>{"  "}{count} words</Text>
              </Box>
              <Text dimColor>{formatBest(getBest("words", count))}</Text>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Time:</Text>
          {TIME_SETTING_OPTIONS.map((seconds) => (
            <Box key={seconds} width="100%">
              <Box flexGrow={1}>
                <Text>{"  "}{seconds}s</Text>
              </Box>
              <Text dimColor>{formatBest(getBest("time", seconds))}</Text>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Quote:</Text>
          <Box width="100%">
            <Box flexGrow={1}>
              <Text>{"  "}Random quote</Text>
            </Box>
            <Text dimColor>{formatBest(quoteBest)}</Text>
          </Box>
        </Box>

        <Menu direction="row" options={[{ label: "Back", onSelect: () => onNavigate("home") }]} />

        <Footer apiStatus={apiStatus} helpText="[esc] back" />
      </Box>
    </Box>
  );
}
