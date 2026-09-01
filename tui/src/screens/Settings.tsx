import { Box, useInput, useStdout } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import type { PracticeSettings, Screen } from "../types.js";
import Footer from "../components/Footer.js";
import type { ApiStatus } from "../hooks/useApiStatus.js";

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  returnTo: "home" | "practice";
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  apiStatus: ApiStatus;
}

const wordCountOptions = [10, 30, 50, 100];

export default function Settings({
  onNavigate,
  returnTo,
  settings,
  onSettingsChange,
  apiStatus,
}: SettingsProps) {
  const { stdout } = useStdout();
  const updateWordCount = (direction: -1 | 1) => {
    const currentIndex = wordCountOptions.indexOf(settings.numWords);
    const nextIndex =
      (currentIndex + direction + wordCountOptions.length) %
      wordCountOptions.length;
    onSettingsChange({
      ...settings,
      numWords: wordCountOptions[nextIndex],
    });
  };

  const settingOptions = [
    {
      label: "Number of words",
      value: String(settings.numWords),
      onLeft: () => updateWordCount(-1),
      onRight: () => updateWordCount(1),
    },
    { label: "Word list", value: "English", onSelect: () => {} },
    { label: "Difficulty", value: "Normal", onSelect: () => {} },
    { label: "Mode", value: "Practice", onSelect: () => {} },
  ];

  useInput((input, key) => {
    if (key.escape) {
      onNavigate(returnTo);
    }
  });

  const menuOptions = [
    ...settingOptions,
    { label: "Back", onSelect: () => onNavigate(returnTo) },
  ];

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      height={stdout.rows}
    >
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="Settings" />
        <Menu direction="column" options={menuOptions} />
        <Footer
          apiStatus={apiStatus}
          helpText="[↑↓] select · [←→] change · [esc] back"
        />
      </Box>
    </Box>
  );
}
