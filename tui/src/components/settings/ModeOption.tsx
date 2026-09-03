import MenuItem from "../menu/MenuItem.js";
import cycleOption from "../../utils/cycleOption.js";
import { useEffect } from "react";
import type { MenuActions } from "../menu/MenuItem.js";
import type { PracticeMode, PracticeSettings } from "../../types.js";

const modeOptions: PracticeMode[] = ["words", "timed"];

interface ModeOptionProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  isSelected?: boolean;
  direction?: "column" | "row";
  registerActions?: (actions: MenuActions) => void;
}

export default function ModeOption({
  settings,
  onSettingsChange,
  isSelected,
  direction,
  registerActions,
}: ModeOptionProps) {
  const update = (direction: -1 | 1) => {
    onSettingsChange({
      ...settings,
      mode: cycleOption(modeOptions, settings.mode, direction),
    });
  };

  useEffect(() => {
    registerActions?.({ onLeft: () => update(-1), onRight: () => update(1) });
  });

  return (
    <MenuItem
      label="Mode"
      value={settings.mode === "words" ? "Words" : "Timed"}
      isSelected={isSelected}
      direction={direction}
      onLeft={() => update(-1)}
      onRight={() => update(1)}
    />
  );
}
