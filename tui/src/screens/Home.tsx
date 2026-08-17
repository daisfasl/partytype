import { Box } from "ink";
import Header from "../components/Header.js";
import DashboardFooter from "../components/dashboard/DashboardFooter.js";
import Menu from "../components/dashboard/Menu.js";
import { Screen } from "../types.js";

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <Box width="100%" height="100%" alignItems="center" justifyContent="center">
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="version 0.1" />
        <Menu onNavigate={onNavigate} />
        <DashboardFooter />
      </Box>
    </Box>
  );
}
