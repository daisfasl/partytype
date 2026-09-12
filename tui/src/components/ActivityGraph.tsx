import { Box, Text } from "ink";
import useTerminalSize from "../hooks/useTerminalSize.js";
import { buildActivityGrid, type ActivityLevel } from "../db/activityGrid.js";
import { getActivity, getTotalTestsCompleted } from "../db/stats.js";

const DEFAULT_WEEKS = 52;
const CELL_WIDTH = 2; // two spaces reads as roughly square in a monospace terminal
const LABEL_WIDTH = 4;
const MIN_WEEKS = 4;

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

const LEVEL_COLORS: Record<ActivityLevel, string> = {
  0: "#2b2b2b",
  1: "#5c4b00",
  2: "#8a6d00",
  3: "#c79a00",
  4: "#ffd60a",
};

function Cell({ level }: { level: ActivityLevel }) {
  return <Text backgroundColor={LEVEL_COLORS[level]}>{" ".repeat(CELL_WIDTH)}</Text>;
}

interface ActivityGraphProps {
  // Width budget available to the graph (e.g. the enclosing bordered box's
  // content width). Falls back to the full terminal width when not given,
  // so the component still works standalone.
  maxWidth?: number;
}

export default function ActivityGraph({ maxWidth }: ActivityGraphProps) {
  const { columns } = useTerminalSize();

  const availableForGrid = (maxWidth ?? columns ?? 80) - LABEL_WIDTH - 2;
  const maxWeeksThatFit = Math.floor(availableForGrid / CELL_WIDTH);
  const weeks = Math.max(MIN_WEEKS, Math.min(DEFAULT_WEEKS, maxWeeksThatFit));

  const total = getTotalTestsCompleted();
  const activity = getActivity(weeks * 7);
  const grid = buildActivityGrid(activity, weeks);

  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between" width="100%">
        <Text>
          <Text bold>{total}</Text> tests completed
        </Text>
        <Text dimColor>{weeks === DEFAULT_WEEKS ? "last 12 months" : `last ${weeks} weeks`}</Text>
      </Box>

      <Box marginTop={1}>
        <Box flexDirection="column" width={LABEL_WIDTH}>
          {DAY_LABELS.map((label, i) => (
            <Text key={i} dimColor>
              {label.padEnd(LABEL_WIDTH)}
            </Text>
          ))}
        </Box>
        <Box flexDirection="row">
          {grid.map((week, wi) => (
            <Box key={wi} flexDirection="column">
              {week.map((day) => (
                <Cell key={day.date} level={day.level} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Less </Text>
        {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
          <Cell key={level} level={level} />
        ))}
        <Text dimColor> More</Text>
      </Box>

      <Box>
        <Text dimColor>All activity data uses UTC time.</Text>
      </Box>
    </Box>
  );
}
