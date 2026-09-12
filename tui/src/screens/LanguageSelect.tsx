import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import { getAvailableLanguages } from "../db/textGeneration.js";
import type { ApiStatus, Screen } from "../types.js";

const ALL_LANGUAGES = getAvailableLanguages();
const VISIBLE_ROWS = 10;

interface LanguageSelectProps {
  onNavigate: (screen: Screen) => void;
  returnTo: Screen;
  currentLanguage: string;
  onSelect: (language: string) => void;
  apiStatus: ApiStatus;
}

export default function LanguageSelect({
  onNavigate,
  returnTo,
  currentLanguage,
  onSelect,
  apiStatus,
}: LanguageSelectProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(ALL_LANGUAGES.indexOf(currentLanguage), 0),
  );

  const filtered = query.trim()
    ? ALL_LANGUAGES.filter((language) =>
        language.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : ALL_LANGUAGES;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const confirmSelection = () => {
    const language = filtered[selectedIndex];
    if (!language) return;
    onSelect(language);
  };

  useInput((_input, key) => {
    if (key.escape) {
      onNavigate(returnTo);
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((index) => Math.max(index - 1, 0));
    }
    if (key.downArrow) {
      setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1));
    }
  });

  const windowStart = Math.min(
    Math.max(selectedIndex - Math.floor(VISIBLE_ROWS / 2), 0),
    Math.max(filtered.length - VISIBLE_ROWS, 0),
  );
  const visible = filtered.slice(windowStart, windowStart + VISIBLE_ROWS);

  return (
    <Box width="100%" alignItems="center" justifyContent="center" height="100%">
      <Box flexDirection="column" borderStyle="round" width={60} paddingX={1}>
        <Header subtitle="Select Language" />
        <Box marginTop={1}>
          <Text dimColor>Current: {currentLanguage}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="cyan">{"> "}</Text>
          <TextInput
            value={query}
            onChange={setQuery}
            onSubmit={confirmSelection}
            placeholder="search languages..."
          />
        </Box>
        <Box flexDirection="column" marginTop={1}>
          {windowStart > 0 && <Text dimColor>↑ {windowStart} more</Text>}
          {visible.length === 0 ? (
            <Text dimColor>No matches</Text>
          ) : (
            visible.map((language, i) => {
              const index = windowStart + i;
              const isSelected = index === selectedIndex;
              return (
                <Text key={language} color={isSelected ? "white" : "gray"}>
                  {isSelected ? "› " : "  "}
                  {language}
                  {language === currentLanguage ? " (current)" : ""}
                </Text>
              );
            })
          )}
          {windowStart + VISIBLE_ROWS < filtered.length && (
            <Text dimColor>
              ↓ {filtered.length - windowStart - VISIBLE_ROWS} more
            </Text>
          )}
        </Box>
        <Footer
          apiStatus={apiStatus}
          helpText="[↑↓] select · [enter] set language · [esc] back"
        />
      </Box>
    </Box>
  );
}
