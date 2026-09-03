import { Box, useInput } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuItem from "../components/MenuItem.js";
import ModeOption from "../components/settings/ModeOption.js";
import TimeLimitOption from "../components/settings/TimeLimitOption.js";
import WordCountOption from "../components/settings/WordCountOption.js";
import type { ApiStatus, PracticeSettings, Screen } from "../types.js";
import Footer from "../components/Footer.js";

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  returnTo: "home" | "practice";
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  apiStatus: ApiStatus;
  windowSize: { columns: number; rows: number };
}

export default function Settings({
  onNavigate,
  returnTo,
  settings,
  onSettingsChange,
  apiStatus,
  windowSize,
}: SettingsProps) {
  useInput((input, key) => {
    if (key.escape) {
      onNavigate(returnTo);
    }
  });

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      height={windowSize.rows}
    >
      <Box
        flexDirection="column"
        borderStyle="round"
        width={Math.min(80, Math.max(40, windowSize.columns - 4))}
        paddingX={1}
      >
        <Header subtitle="Settings" />
        <Menu direction="column">
          <ModeOption settings={settings} onSettingsChange={onSettingsChange} />
          {settings.mode === "words" ? (
            <WordCountOption
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          ) : (
            <TimeLimitOption
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          )}
          <MenuItem label="Word list" value="English" />
          <MenuItem label="Difficulty" value="Normal" />
          <MenuItem label="Back" onSelect={() => onNavigate(returnTo)} />
        </Menu>
        <Footer
          apiStatus={apiStatus}
          helpText="[↑↓] select · [←→] change · [esc] back"
        />
      </Box>
    </Box>
  );
}
