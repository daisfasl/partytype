import { Box, Text } from "ink";
import Gradient from "ink-gradient";

interface HeaderProps {
  subtitle?: string;
}

export default function Header({ subtitle }: HeaderProps) {
  return (
    <Box justifyContent="space-between" width="100%">
      <Gradient name="pastel">
        <Text bold>partyType</Text>
      </Gradient>
      {subtitle && <Text dimColor>{subtitle}</Text>}
    </Box>
  );
}
