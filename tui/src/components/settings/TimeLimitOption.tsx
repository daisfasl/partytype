import MenuItem from "../menu/MenuItem.js";
import cycleOption from "../../utils/cycleOption.js";
import { useEffect } from "react";
import type { MenuActions } from "../menu/MenuItem.js";
import type { PracticeSettings } from "../../types.js";

const timeLimitOptions = [15, 30, 60, 120] as const;

interface TimeLimitOptionProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  isSelected?: boolean;
  direction?: "column" | "row";
  registerActions?: (actions: MenuActions) => void;
}

export default function TimeLimitOption({
  settings,
  onSettingsChange,
  isSelected,
  direction,
  registerActions,
}: TimeLimitOptionProps) {
  const update = (direction: -1 | 1) => {
    onSettingsChange({
      ...settings,
      timeLimit: cycleOption(timeLimitOptions, settings.timeLimit, direction),
    });
  };

  useEffect(() => {
    registerActions?.({ onLeft: () => update(-1), onRight: () => update(1) });
  });

  return (
    <MenuItem
      label="Timer"
      value={`${settings.timeLimit}s`}
      isSelected={isSelected}
      direction={direction}
      onLeft={() => update(-1)}
      onRight={() => update(1)}
    />
  );
}
