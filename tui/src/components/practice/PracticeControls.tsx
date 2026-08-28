import { Box } from "ink";
import Menu from "../Menu.js";

interface PracticeControlsProps {
  onRestart: () => void;
  onSettings: () => void;
  onExit: () => void;
}

export default function PracticeControls({
  onRestart,
  onSettings,
  onExit,
}: PracticeControlsProps) {
  return (
    <Box width={60} alignSelf="center" justifyContent="center">
      <Menu
        direction="row"
        options={[
          { label: "Restart ↻", onSelect: onRestart },
          { label: "Settings ⚙", onSelect: onSettings },
          { label: "Exit [Esc]", onSelect: onExit },
        ]}
      />
    </Box>
  );
}
