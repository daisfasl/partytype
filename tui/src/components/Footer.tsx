import { Box, Text } from "ink";
import type { ApiStatus } from "../hooks/useApiStatus.js";

interface FooterProps {
  apiStatus?: ApiStatus;
  helpText?: string;
}

export default function Footer({
  apiStatus = "offline",
  helpText = "[↑↓] select · [enter] open · [q] quit",
}: FooterProps) {
  const isOnline = apiStatus === "online";

  return (
    <Box
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor="gray"
      paddingX={1}
      marginTop={1}
      justifyContent="space-between"
    >
      <Text color={isOnline ? "green" : "red"}>
        {isOnline ? "● online" : "● offline"}
      </Text>
      <Text dimColor>{helpText}</Text>
    </Box>
  );
}
