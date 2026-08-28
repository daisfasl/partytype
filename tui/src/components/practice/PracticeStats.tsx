import { Box, Text } from "ink";
import type { Status } from "../../types.js";

interface PracticeStatsProps {
  status: Status;
  wpm: number;
  accuracy: number;
}

export default function PracticeStats({
  status,
  wpm,
  accuracy,
}: PracticeStatsProps) {
  if (status !== "completed") return null;

  return (
    <Box alignSelf="center" justifyContent="center" marginTop={1}>
      <Text>wpm: {wpm}</Text>
      <Text> accuracy: {accuracy}%</Text>
    </Box>
  );
}
