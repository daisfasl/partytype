import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import { getDisplayName, setDisplayName } from "../config.js";
import type { UseParty } from "../hooks/useParty.js";
import type { ApiStatus, Screen } from "../types.js";

interface CreatePartyProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
  party: UseParty;
}

export default function CreateParty({
  onNavigate,
  apiStatus,
  party,
}: CreatePartyProps) {
  const [name, setName] = useState(getDisplayName());
  const [submitted, setSubmitted] = useState(false);

  const errorMessage =
    party.lastEvent?.kind === "error" ? party.lastEvent.message : null;

  // Navigate on to the lobby once the connection is confirmed by a
  // RoomPayload - `party` is the same connection instance across screens,
  // so this just watches state that App.tsx already owns.
  useEffect(() => {
    if (submitted && party.room) {
      onNavigate("lobby");
    }
  }, [submitted, party.room, onNavigate]);

  // Creating a party can't really fail server-side (there's no existing
  // room/name to collide with), but a socket-level error (e.g. backend
  // unreachable) should still let the player retry rather than get stuck.
  useEffect(() => {
    if (submitted && party.status === "error") {
      setSubmitted(false);
    }
  }, [submitted, party.status]);

  useInput((_input, key) => {
    if (key.escape && !submitted) {
      onNavigate("home");
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setSubmitted(true);
    party.createParty(trimmed);
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
        <Header subtitle="Create a Party" />
        <Box flexDirection="column" marginTop={1}>
          <Text>Enter your display name:</Text>
          <Box marginTop={1}>
            <Text color="cyan">{"> "}</Text>
            <TextInput
              value={name}
              onChange={setName}
              onSubmit={handleSubmit}
            />
          </Box>
          {isConnecting && <Text dimColor>Creating party...</Text>}
          {errorMessage && <Text color="red">{errorMessage}</Text>}
          {!errorMessage && submitted && party.status === "error" && (
            <Text color="red">Could not reach the server. Try again.</Text>
          )}
        </Box>
        <Footer
          apiStatus={apiStatus}
          helpText="[enter] create · [esc] back"
        />
      </Box>
    </Box>
  );
}
