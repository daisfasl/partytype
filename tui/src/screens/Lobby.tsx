import { Box, Text, useInput } from "ink";
import { useEffect } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import Menu from "../components/Menu.js";
import { generateText, TIME_MODE_WORD_BUFFER } from "../db/textGeneration.js";
import type { UseParty } from "../hooks/useParty.js";
import type { ApiStatus, GameMode, Screen } from "../types.js";

interface LobbyProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
  party: UseParty;
}

const MODE_OPTIONS: GameMode[] = ["time", "words", "quote"];
const WORD_COUNT_OPTIONS = [10, 25, 50, 100, 200];
const TIME_SETTING_OPTIONS = [15, 30, 60, 120, 300];

export default function Lobby({ onNavigate, apiStatus, party }: LobbyProps) {
  const room = party.room;
  const isHost = !!room && party.playerId === room.host;

  // The countdown itself is Race's job - Lobby just hands off as soon as the
  // room leaves "waiting" (host hit start).
  useEffect(() => {
    if (room && room.status !== "waiting") {
      onNavigate("race");
    }
  }, [room?.status, onNavigate]);

  const handleLeave = () => {
    party.leave();
    onNavigate("home");
  };

  const sendSettings = (next: {
    mode: GameMode;
    time_setting: number;
    word_count: number;
    language: string;
  }) => {
    party.send({ type: "settings", ...next });
  };

  const cycleMode = (direction: -1 | 1) => {
    if (!room) return;
    const currentIndex = MODE_OPTIONS.indexOf(room.mode);
    const nextIndex =
      (currentIndex + direction + MODE_OPTIONS.length) % MODE_OPTIONS.length;
    sendSettings({
      mode: MODE_OPTIONS[nextIndex],
      time_setting: room.time_setting,
      word_count: room.word_count,
      language: room.language,
    });
  };

  const cycleWordCount = (direction: -1 | 1) => {
    if (!room) return;
    const currentIndex = WORD_COUNT_OPTIONS.indexOf(room.word_count);
    const nextIndex =
      (currentIndex === -1
        ? 0
        : currentIndex + direction + WORD_COUNT_OPTIONS.length) %
      WORD_COUNT_OPTIONS.length;
    sendSettings({
      mode: room.mode,
      time_setting: room.time_setting,
      word_count: WORD_COUNT_OPTIONS[nextIndex],
      language: room.language,
    });
  };

  const cycleTimeSetting = (direction: -1 | 1) => {
    if (!room) return;
    const currentIndex = TIME_SETTING_OPTIONS.indexOf(room.time_setting);
    const nextIndex =
      (currentIndex === -1
        ? 0
        : currentIndex + direction + TIME_SETTING_OPTIONS.length) %
      TIME_SETTING_OPTIONS.length;
    sendSettings({
      mode: room.mode,
      time_setting: TIME_SETTING_OPTIONS[nextIndex],
      word_count: room.word_count,
      language: room.language,
    });
  };

  const handleStart = () => {
    if (!room) return;
    const text =
      room.mode === "quote"
        ? generateText("quote", 0, room.language)
        : room.mode === "words"
          ? generateText("words", room.word_count, room.language)
          : generateText("time", TIME_MODE_WORD_BUFFER, room.language);
    party.send({ type: "start", text });
  };

  useInput((_input, key) => {
    if (key.escape) {
      handleLeave();
    }
  });

  if (!room) {
    return (
      <Box
        width="100%"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
          <Header subtitle="Lobby" />
          <Box marginTop={1}>
            <Text dimColor>Connecting...</Text>
          </Box>
          <Footer apiStatus={apiStatus} helpText="[esc] back" />
        </Box>
      </Box>
    );
  }

  const hostOptions = [
    {
      label: "Mode",
      value: room.mode,
      onLeft: () => cycleMode(-1),
      onRight: () => cycleMode(1),
    },
    ...(room.mode === "words"
      ? [
          {
            label: "Word count",
            value: String(room.word_count),
            onLeft: () => cycleWordCount(-1),
            onRight: () => cycleWordCount(1),
          },
        ]
      : []),
    ...(room.mode === "time"
      ? [
          {
            label: "Time (seconds)",
            value: String(room.time_setting),
            onLeft: () => cycleTimeSetting(-1),
            onRight: () => cycleTimeSetting(1),
          },
        ]
      : []),
    {
      label: "Language",
      value: room.language,
      onSelect: () => onNavigate("language-select"),
    },
    { label: "Start Race", onSelect: handleStart },
    { label: "Leave", onSelect: handleLeave },
  ];

  const guestOptions = [{ label: "Leave", onSelect: handleLeave }];

  return (
    <Box width="100%" alignItems="center" justifyContent="center" height="100%">
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="Lobby" />

        <Box flexDirection="column" marginTop={1}>
          <Text>
            Room code:{" "}
            <Text bold color="cyan">
              {room.room}
            </Text>
          </Text>
          <Text dimColor>Share this code with friends to join.</Text>
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Players:</Text>
          {Object.keys(room.players).map((id) => (
            <Text key={id}>
              {"  "}
              {id}
              {id === room.host ? " (host)" : ""}
              {id === party.playerId ? " (you)" : ""}
            </Text>
          ))}
        </Box>

        {!isHost && (
          <Box flexDirection="column" marginTop={1}>
            <Text dimColor>
              Mode: {room.mode}
              {room.mode === "words" && ` · ${room.word_count} words`}
              {room.mode === "time" && ` · ${room.time_setting}s`}
              {` · ${room.language}`}
            </Text>
            <Text dimColor>Waiting for host to start...</Text>
          </Box>
        )}

        <Menu
          direction="column"
          options={isHost ? hostOptions : guestOptions}
        />

        <Footer
          apiStatus={apiStatus}
          helpText={
            isHost
              ? "[↑↓] select · [←→] change · [enter] confirm · [esc] leave"
              : "[esc] leave"
          }
        />
      </Box>
    </Box>
  );
}
