import { useState } from "react";
import Home from "./screens/Home.js";
import Practice from "./screens/Practice.js";
import { Screen } from "./types.js";

export default function App() {
  const [currentScreen, setScreen] = useState<Screen>("practice");

  function navigateTo(screen: Screen) {
    setScreen(screen);
  }

  if (currentScreen === "home") {
    return <Home onNavigate={navigateTo} />;
  } else if (currentScreen === "practice") {
    return <Practice onNavigate={navigateTo} />;
  }
}
