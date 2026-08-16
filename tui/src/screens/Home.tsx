import { Box } from "ink";
import DashboardHeader from "../components/dashboard/DashboardHeader.js";
import DashboardFooter from "../components/dashboard/DashboardFooter.js";
import Menu from "../components/dashboard/Menu.js";

interface HomeProps {
  onNavigate: (screen: "home" | "practice") => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <Box width="100%" height="100%" alignItems="center" justifyContent="center">
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <DashboardHeader />
        <Menu onNavigate={onNavigate} />
        <DashboardFooter />
      </Box>
    </Box>
  );
}
