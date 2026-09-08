import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import { getDisplayName, setDisplayName } from "../config.js";
import type { UseParty } from "../hooks/useParty.js";
import type { ApiStatus, Screen } from "../types.js";

interface JoinPartyProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
  party: UseParty;
}

type Step = "room" | "name";

export default function JoinParty({
  onNavigate,
  apiStatus,
  party,
}: JoinPartyProps) {
  const [step, setStep] = useState<Step>("room");
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState(getDisplayName());
  const [submitted, setSubmitted] = useState(false);

  const errorMessage =
    party.lastEvent?.kind === "error" ? party.lastEvent.message : null;

  useEffect(() => {
    if (submitted && party.room) {
      onNavigate("lobby");
    }
  }, [submitted, party.room, onNavigate]);

  // The backend sends one ErrorPayload and closes on failure (room not
  // found, not waiting, or name already taken) - surface it and let the
  // player retry on the name field rather than kicking them back to Home.
  useEffect(() => {
    if (submitted && party.status === "error") {
      setSubmitted(false);
      setStep("name");
    }
  }, [submitted, party.status]);

  useInput((_input, key) => {
    if (submitted) return;
    if (key.escape) {
      if (step === "name") {
        setStep("room");
      } else {
        onNavigate("home");
      }
    }
  });

  const handleRoomSubmit = (value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    setRoomCode(trimmed);
    setStep("name");
  };

  const handleNameSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setSubmitted(true);
    party.joinParty(roomCode, trimmed);
  };

  const isConnecting = submitted && party.status !== "error" && !party.room;

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="Join a Party" />
        <Box flexDirection="column" marginTop={1}>
          {step === "room" ? (
            <>
              <Text>Enter the room code:</Text>
              <Box marginTop={1}>
                <Text color="cyan">{"> "}</Text>
                <TextInput
                  value={roomCode}
                  onChange={(value) => setRoomCode(value.toUpperCase())}
                  onSubmit={handleRoomSubmit}
                />
              </Box>
            </>
          ) : (
            <>
              <Text dimColor>Room: {roomCode}</Text>
              <Box marginTop={1} flexDirection="column">
                <Text>Enter your display name:</Text>
                <Box marginTop={1}>
                  <Text color="cyan">{"> "}</Text>
                  <TextInput
                    value={name}
                    onChange={setName}
                    onSubmit={handleNameSubmit}
                  />
                </Box>
              </Box>
            </>
          )}
          {isConnecting && <Text dimColor>Joining party...</Text>}
          {errorMessage && <Text color="red">{errorMessage}</Text>}
        </Box>
        <Footer
          apiStatus={apiStatus}
          helpText="[enter] confirm · [esc] back"
        />
      </Box>
    </Box>
  );
}
