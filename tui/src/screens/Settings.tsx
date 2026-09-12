import { Box, useInput } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import type { PracticeSettings, Screen } from "../types.js";
import Footer from "../components/Footer.js";
import type { ApiStatus } from "../types.js";

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  returnTo: "home" | "practice";
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  apiStatus: ApiStatus;
}

const wordCountOptions = [10, 30, 50, 100];
const timeSecondsOptions = [15, 30, 60, 120, 300];
const modeOptions: PracticeSettings["mode"][] = ["words", "time", "quote"];

export default function Settings({
  onNavigate,
  returnTo,
  settings,
  onSettingsChange,
  apiStatus,
}: SettingsProps) {
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

  const updateTimeSeconds = (direction: -1 | 1) => {
    const currentIndex = timeSecondsOptions.indexOf(settings.timeSeconds);
    const nextIndex =
      (currentIndex + direction + timeSecondsOptions.length) %
      timeSecondsOptions.length;
    onSettingsChange({
      ...settings,
      timeSeconds: timeSecondsOptions[nextIndex],
    });
  };

  const updateMode = (direction: -1 | 1) => {
    const currentIndex = modeOptions.indexOf(settings.mode);
    const nextIndex =
      (currentIndex + direction + modeOptions.length) % modeOptions.length;
    onSettingsChange({
      ...settings,
      mode: modeOptions[nextIndex],
    });
  };

  const settingOptions = [
    {
      label: "Mode",
      value: settings.mode,
      onLeft: () => updateMode(-1),
      onRight: () => updateMode(1),
    },
    ...(settings.mode === "words"
      ? [
          {
            label: "Number of words",
            value: String(settings.numWords),
            onLeft: () => updateWordCount(-1),
            onRight: () => updateWordCount(1),
          },
        ]
      : []),
    ...(settings.mode === "time"
      ? [
          {
            label: "Time (seconds)",
            value: String(settings.timeSeconds),
            onLeft: () => updateTimeSeconds(-1),
            onRight: () => updateTimeSeconds(1),
          },
        ]
      : []),
    {
      label: "Word list",
      value: settings.language,
      onSelect: () => onNavigate("language-select"),
    },
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
      height="100%"
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
