import { Box, Text } from "ink";
import type { ApiStatus } from "../types.js";

interface FooterProps {
  apiStatus?: ApiStatus;
  helpText?: string;
}

// Fits both pieces on one line (space-between) unless the help text is long
// enough to collide with the status indicator, in which case they stack.
const MAX_INLINE_HELP_LENGTH = 46;

export default function Footer({
  apiStatus = "offline",
  helpText = "[↑↓] select · [enter] open · [q] quit",
}: FooterProps) {
  const isOnline = apiStatus === "online";
  const statusText = isOnline ? "● online" : "● offline";
  const stacked = helpText.length > MAX_INLINE_HELP_LENGTH;

  return (
    <Box
      flexDirection={stacked ? "column" : "row"}
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor="gray"
      paddingX={1}
      marginTop={1}
      justifyContent={stacked ? "flex-start" : "space-between"}
    >
      <Text color={isOnline ? "green" : "red"}>{statusText}</Text>
      <Text dimColor>{helpText}</Text>
    </Box>
  );
}
