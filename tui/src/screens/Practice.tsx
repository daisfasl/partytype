import { Box, Text, useInput, useStdout } from "ink";
import Header from "../components/Header.js";
import type { Screen } from "../types.js";
import Menu from "../components/Menu.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import { useEffect, useState } from "react";

interface PracticeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Practice({ onNavigate }: PracticeProps) {
  const { stdout } = useStdout();
  const terminalHeight = stdout.rows;
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:8000/api/words?dataset_file=english.json")
      .then((response) => response.json())
      .then((data) => setPrompt(data.words.join(" ")))
      .catch((error) => console.error(error));
  }, []);

  const { status, typed, restart, wpm, accuracy } = useTypingEngine(prompt);
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
    <Box flexDirection="column" padding={1} height={terminalHeight}>
      {/* Header */}
      <Header subtitle="Practice Mode" />

      <Box flexGrow={1} flexDirection="column" justifyContent="center">
        {/* Typing Text Box */}
        <Box width={60} alignSelf="center">
          {prompt != "" ? (
            <Text>
              {prompt.split("").map((char, index) => {
                const isCurrent = index === typed.length;
                const isTyped = index < typed.length;
                const isCorrect = isTyped && typed[index] == char;
                const isIncorrect = isTyped && typed[index] != char;

                return (
                  <Text
                    key={index}
                    color={
                      isCorrect
                        ? "#a6e3a1"
                        : isIncorrect
                          ? "#f38ba8"
                          : undefined
                    }
                    inverse={isCurrent}
                    dimColor={!isTyped && !isCurrent}
                  >
                    {char}
                  </Text>
                );
              })}
            </Text>
          ) : (
            <Text>Loading...</Text>
          )}
        </Box>

        {/* Statistics */}
        {status === "completed" && (
          <Box alignSelf="center" justifyContent="center" marginTop={1}>
            <Text>wpm: {wpm}</Text>
            <Text> accuracy: {accuracy}%</Text>
          </Box>
        )}

        {/* Footer Controls */}
        {status !== "typing" && (
          <Box width={60} alignSelf="center" justifyContent="center">
            <Menu direction="row" options={menuOptions} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
