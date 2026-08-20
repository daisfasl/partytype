import { Box, Text, useInput } from "ink";
import Header from "../components/Header.js";
import type { Screen } from "../types.js";
import { useState } from "react";
import { Status } from "../types.js";
import Menu from "../components/Menu.js";
import useTypingEngine from "../hooks/useTypingEngine.js";

interface PracticeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Practice({ onNavigate }: PracticeProps) {
  const mockPrompt =
    "The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.";
  const { status, typed, restart } = useTypingEngine(mockPrompt);
  const menuOptions: { label: string; onSelect: () => void }[] = [
    { label: "Restart ↻", onSelect: () => restart() },
    { label: "Settings ⚙", onSelect: () => {} },
    { label: "Exit [Esc]", onSelect: () => onNavigate("home") },
  ];

  useInput((input, key) => {
    if (key.escape) {
      onNavigate("home");
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Header subtitle="Practice Mode" />

      {/* Typing Text Box */}
      <Box width={60} alignSelf="center" paddingY={1}>
        <Text>
          {mockPrompt.split("").map((char, index) => {
            const isCurrent = index === typed.length;
            const isTyped = index < typed.length;
            const isCorrect = isTyped && typed[index] == char;
            const isIncorrect = isTyped && typed[index] != char;
            return (
              <Text
                key={index}
                color={
                  isCorrect ? "#a6e3a1" : isIncorrect ? "#f38ba8" : undefined
                }
                inverse={isCurrent}
                dimColor={!isTyped && !isCurrent}
              >
                {char}
              </Text>
            );
          })}
        </Text>
      </Box>

      {/* Footer Controls */}
      {status !== "typing" && (
        <Box width={60} alignSelf="center" justifyContent="center">
          <Menu direction="row" options={menuOptions} />
        </Box>
      )}
    </Box>
  );
}
