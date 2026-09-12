import { useCallback, useState } from "react";
import { Box } from "ink";
import Home from "./screens/Home.js";
import Practice from "./screens/Practice.js";
import Settings from "./screens/Settings.js";
import CreateParty from "./screens/CreateParty.js";
import JoinParty from "./screens/JoinParty.js";
import Lobby from "./screens/Lobby.js";
import Race from "./screens/Race.js";
import Stats from "./screens/Stats.js";
import LanguageSelect from "./screens/LanguageSelect.js";
import { PracticeSettings, Screen } from "./types.js";
import useApi from "./hooks/useApiStatus.js";
import useParty from "./hooks/useParty.js";
import useTerminalSize from "./hooks/useTerminalSize.js";

export default function App() {
  const { columns, rows } = useTerminalSize();
  const [currentScreen, setScreen] = useState<Screen>("home");
  // Called once here (not inside Lobby/Race) so the same websocket
  // connection survives navigation between those screens - see
  // hooks/useParty.ts for why.
  const party = useParty();
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<
    "home" | "practice"
  >("home");
  const [languageSelectReturnScreen, setLanguageSelectReturnScreen] =
    useState<"settings" | "lobby">("settings");
  const [practiceSettings, setPracticeSettings] = useState<PracticeSettings>({
    numWords: 30,
    timeSeconds: 30,
    mode: "words",
    language: "english",
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
    if (
      screen === "language-select" &&
      (currentScreen === "settings" || currentScreen === "lobby")
    ) {
      setLanguageSelectReturnScreen(currentScreen);
    }
    // Leaving back to Home always tears down any active party connection -
    // no-op if there isn't one.
    if (screen === "home") {
      party.leave();
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
  } else if (currentScreen === "create-party") {
    screen = (
      <CreateParty
        onNavigate={navigateTo}
        apiStatus={apiStatus}
        party={party}
      />
    );
  } else if (currentScreen === "join-party") {
    screen = (
      <JoinParty onNavigate={navigateTo} apiStatus={apiStatus} party={party} />
    );
  } else if (currentScreen === "lobby") {
    screen = (
      <Lobby onNavigate={navigateTo} apiStatus={apiStatus} party={party} />
    );
  } else if (currentScreen === "race") {
    screen = (
      <Race onNavigate={navigateTo} apiStatus={apiStatus} party={party} />
    );
  } else if (currentScreen === "stats") {
    screen = <Stats onNavigate={navigateTo} apiStatus={apiStatus} />;
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
  } else if (currentScreen === "language-select") {
    const room = party.room;
    screen = (
      <LanguageSelect
        onNavigate={navigateTo}
        returnTo={languageSelectReturnScreen}
        currentLanguage={
          languageSelectReturnScreen === "lobby"
            ? (room?.language ?? "english")
            : practiceSettings.language
        }
        onSelect={(language) => {
          if (languageSelectReturnScreen === "lobby") {
            if (!room) return;
            party.send({
              type: "settings",
              mode: room.mode,
              time_setting: room.time_setting,
              word_count: room.word_count,
              language,
            });
          } else {
            setPracticeSettings((prev) => ({ ...prev, language }));
          }
        }}
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
