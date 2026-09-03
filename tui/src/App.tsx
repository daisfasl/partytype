import { useCallback, useState } from "react";
import { Box } from "ink";
import Home from "./screens/Home.js";
import Practice from "./screens/Practice.js";
import Settings from "./screens/Settings.js";
import { PracticeSettings, Screen } from "./types.js";
import useApi from "./hooks/useApiStatus.js";
import useTerminalSize from "./hooks/useTerminalSize.js";

export default function App() {
  const { columns, rows } = useTerminalSize();
  const [currentScreen, setScreen] = useState<Screen>("practice");
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<
    "home" | "practice"
  >("home");
  const [practiceSettings, setPracticeSettings] = useState<PracticeSettings>({
    numWords: 30,
  });
  const healthRequest = useCallback(
    () =>
      fetch("http://localhost:8000/api/health").then((response) => {
        if (!response.ok)
          throw new Error(`API health check failed (${response.status})`);
        return response.json();
      }),
    [],
  );
  const { status: apiStatus } = useApi(healthRequest);

  function navigateTo(screen: Screen) {
    if (
      screen === "settings" &&
      (currentScreen === "home" || currentScreen === "practice")
    ) {
      setSettingsReturnScreen(currentScreen);
    }
    setScreen(screen);
  }

  let screen;
  if (currentScreen === "home") {
    screen = <Home onNavigate={navigateTo} apiStatus={apiStatus} />;
  } else if (currentScreen === "practice") {
    screen = (
      <Practice
        onNavigate={navigateTo}
        settings={practiceSettings}
        apiStatus={apiStatus}
      />
    );
  } else if (currentScreen === "settings") {
    screen = (
      <Settings
        onNavigate={navigateTo}
        returnTo={settingsReturnScreen}
        settings={practiceSettings}
        onSettingsChange={setPracticeSettings}
        apiStatus={apiStatus}
      />
    );
  }

  return (
    <Box width={columns} height={rows} flexDirection="column">
      {screen}
    </Box>
  );
}
