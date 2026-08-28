import { Box, Text } from "ink";

interface DashboardFooterProps {
  statusText?: string;
  helpText?: string;
}

export default function DashboardFooter({
  statusText = "offline",
  helpText = "[↑↓] select · [enter] open · [q] quit",
}: DashboardFooterProps) {
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
      <Text color="red">{statusText}</Text>
      {/* online when connected to API */}
      <Text dimColor>{helpText}</Text>
    </Box>
  );
}
