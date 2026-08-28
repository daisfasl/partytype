import { useState } from "react";
import Home from "./screens/Home.js";
import Practice from "./screens/Practice.js";
import Settings from "./screens/Settings.js";
import { PracticeSettings, Screen } from "./types.js";

export default function App() {
  const [currentScreen, setScreen] = useState<Screen>("practice");
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<
    "home" | "practice"
  >("home");
  const [practiceSettings, setPracticeSettings] = useState<PracticeSettings>({
    numWords: 30,
  });

  function navigateTo(screen: Screen) {
    if (
      screen === "settings" &&
      (currentScreen === "home" || currentScreen === "practice")
    ) {
      setSettingsReturnScreen(currentScreen);
    }
    setScreen(screen);
  }

  if (currentScreen === "home") {
    return <Home onNavigate={navigateTo} />;
  } else if (currentScreen === "practice") {
    return <Practice onNavigate={navigateTo} settings={practiceSettings} />;
  } else if (currentScreen === "settings") {
    return (
      <Settings
        onNavigate={navigateTo}
        returnTo={settingsReturnScreen}
        settings={practiceSettings}
        onSettingsChange={setPracticeSettings}
      />
    );
  }
}
