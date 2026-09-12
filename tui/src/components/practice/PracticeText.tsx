import { Box, Text } from "ink";

const WRAP_WIDTH = 60;

interface PracticeTextProps {
  prompt: string;
  typed: string;
  visibleLines?: number;
}

interface WrappedLine {
  words: string[];
  startIndex: number;
  length: number;
}

function wrapIntoLines(prompt: string): WrappedLine[] {
  const words = prompt.split(" ");
  const lines: WrappedLine[] = [];
  let currentWords: string[] = [];
  let currentLength = 0;
  let lineStart = 0;
  let charIndex = 0;

  words.forEach((word, wordIndex) => {
    const wordWithSpace = wordIndex < words.length - 1 ? `${word} ` : word;
    if (
      currentLength + wordWithSpace.length > WRAP_WIDTH &&
      currentWords.length > 0
    ) {
      lines.push({
        words: currentWords,
        startIndex: lineStart,
        length: currentLength,
      });
      currentWords = [];
      currentLength = 0;
      lineStart = charIndex;
    }
    currentWords.push(wordWithSpace);
    currentLength += wordWithSpace.length;
    charIndex += wordWithSpace.length;
  });

  if (currentWords.length > 0) {
    lines.push({
      words: currentWords,
      startIndex: lineStart,
      length: currentLength,
    });
  }

  return lines;
}

export default function PracticeText({
  prompt,
  typed,
  visibleLines,
}: PracticeTextProps) {
  if (prompt === "") {
    return <Text>Loading...</Text>;
  }

  const lines = wrapIntoLines(prompt);

  let windowLines = lines;
  if (visibleLines) {
    let currentLineIndex = lines.findIndex(
      (line) => typed.length < line.startIndex + line.length,
    );
    if (currentLineIndex === -1) currentLineIndex = lines.length - 1;
    // Keep the first two rows in place until the player clears row two
    const windowStart = Math.max(
      0,
      Math.min(currentLineIndex - 1, lines.length - visibleLines),
    );
    windowLines = lines.slice(windowStart, windowStart + visibleLines);
  }

  let charIndex = windowLines[0]?.startIndex ?? 0;

  return (
    <Box width={WRAP_WIDTH} alignSelf="center" flexDirection="column">
      {windowLines.map((line, lineIndex) => (
        <Box key={lineIndex} flexDirection="row">
          {line.words.map((wordWithSpace, wordIndex) => (
            <Text key={wordIndex}>
              {wordWithSpace.split("").map((char) => {
                const currentIndex = charIndex++;
                const isTyped = currentIndex < typed.length;
                const isCurrent = currentIndex === typed.length;
                return (
                  <Text
                    key={currentIndex}
                    color={
                      isTyped
                        ? typed[currentIndex] === char
                          ? "#a6e3a1"
                          : "#f38ba8"
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
          ))}
        </Box>
      ))}
    </Box>
  );
}
