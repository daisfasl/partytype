import { Box, useWindowSize } from "ink";
import Menu from "../menu/Menu.js";
import MenuItem from "../menu/MenuItem.js";

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
  const { columns } = useWindowSize();
  const controlsWidth = Math.max(20, Math.min(columns - 4, columns));

  return (
    <Box width={controlsWidth} alignSelf="center" justifyContent="center">
      <Menu direction="row">
        <MenuItem label="Restart ↻" onSelect={onRestart} />
        <MenuItem label="Settings ⚙" onSelect={onSettings} />
        <MenuItem label="Exit [Esc]" onSelect={onExit} />
      </Menu>
    </Box>
  );
}
