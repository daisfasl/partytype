import { Box, useInput } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import type { PracticeSettings, Screen } from "../types.js";
import Footer from "../components/Footer.js";
import type { ApiStatus } from "../types.js";
import { getAvailableLanguages } from "../db/textGeneration.js";

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  returnTo: "home" | "practice";
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  apiStatus: ApiStatus;
}

const wordCountOptions = [10, 30, 50, 100];
const modeOptions: PracticeSettings["mode"][] = ["words", "time", "quote"];
const languageOptions = getAvailableLanguages();

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

  const updateMode = (direction: -1 | 1) => {
    const currentIndex = modeOptions.indexOf(settings.mode);
    const nextIndex =
      (currentIndex + direction + modeOptions.length) % modeOptions.length;
    onSettingsChange({
      ...settings,
      mode: modeOptions[nextIndex],
    });
  };

  const updateLanguage = (direction: -1 | 1) => {
    const currentIndex = languageOptions.indexOf(settings.language);
    const nextIndex =
      (currentIndex === -1 ? 0 : currentIndex + direction + languageOptions.length) %
      languageOptions.length;
    onSettingsChange({
      ...settings,
      language: languageOptions[nextIndex],
    });
  };

  const settingOptions = [
    {
      label: "Mode",
      value: settings.mode,
      onLeft: () => updateMode(-1),
      onRight: () => updateMode(1),
    },
    {
      label: "Number of words",
      value: String(settings.numWords),
      onLeft: () => updateWordCount(-1),
      onRight: () => updateWordCount(1),
    },
    {
      label: "Word list",
      value: settings.language,
      onLeft: () => updateLanguage(-1),
      onRight: () => updateLanguage(1),
    },
    { label: "Difficulty", value: "Normal", onSelect: () => {} },
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
