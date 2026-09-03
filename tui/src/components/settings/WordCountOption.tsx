import MenuItem from "../MenuItem.js";
import cycleOption from "../../utils/cycleOption.js";
import { useEffect } from "react";
import type { MenuActions } from "../MenuItem.js";
import type { PracticeSettings } from "../../types.js";

const wordCountOptions = [10, 30, 50, 100] as const;

interface WordCountOptionProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  isSelected?: boolean;
  direction?: "column" | "row";
  registerActions?: (actions: MenuActions) => void;
}

export default function WordCountOption({
  settings,
  onSettingsChange,
  isSelected,
  direction,
  registerActions,
}: WordCountOptionProps) {
  const update = (direction: -1 | 1) => {
    onSettingsChange({
      ...settings,
      numWords: cycleOption(wordCountOptions, settings.numWords, direction),
    });
  };

  useEffect(() => {
    registerActions?.({ onLeft: () => update(-1), onRight: () => update(1) });
  });

<<<<<<< HEAD
  return (
    <MenuItem
      label="Number of words"
      value={String(settings.numWords)}
      isSelected={isSelected}
      direction={direction}
      onLeft={() => update(-1)}
      onRight={() => update(1)}
    />
  );
}
=======
  return <MenuItem label="Number of words" value={String(settings.numWords)} isSelected={isSelected} direction={direction} onLeft={() => update(-1)} onRight={() => update(1)} />;
}
>>>>>>> dff8978ad73c5f27fb22c538ff5a282818f55f0c
