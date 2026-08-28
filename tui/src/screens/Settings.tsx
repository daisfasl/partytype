import { Box, Text, useInput, useStdout } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import type { Screen } from "../types.js";
import Footer from "../components/Footer.js";

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  returnTo: "home" | "practice";
}

const settingOptions = [
  { label: "Word list", onSelect: () => {} },
  { label: "Test length", onSelect: () => {} },
  { label: "Difficulty", onSelect: () => {} },
  { label: "Mode:", onSelect: () => {} },
];

export default function Settings({ onNavigate, returnTo }: SettingsProps) {
  const { stdout } = useStdout();

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
        <Footer helpText="[↑↓] select · [enter] change · [esc] back" />
      </Box>
    </Box>
  );
}
