import { Box, Text, useStdout } from "ink";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import Menu from "../components/Menu.js";
import { Screen } from "../types.js";
import type { ApiStatus } from "../hooks/useApiStatus.js";

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
}

export default function Home({ onNavigate, apiStatus }: HomeProps) {
  const menuOptions: { label: string; onSelect: () => void }[] = [
    { label: "Practice Mode", onSelect: () => onNavigate("practice") },
    { label: "Create a Party", onSelect: () => onNavigate("create-party") },
    { label: "Join a Party", onSelect: () => onNavigate("join-party") },
    { label: "Settings", onSelect: () => onNavigate("settings") },
  ];
  const { stdout } = useStdout();

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      height={stdout.rows}
    >
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="version 0.1" />
        {/* Welcome Message */}
        <Box flexDirection="column" marginTop={1}>
          <Text>Welcome.</Text>
          <Text>How would you like to type?</Text>
        </Box>
        <Menu direction="column" options={menuOptions} />
        <Footer apiStatus={apiStatus} />
      </Box>
    </Box>
  );
}
