import { Box, Text, useWindowSize } from "ink";

interface PracticeTextProps {
  prompt: string;
  typed: string;
}

export default function PracticeText({ prompt, typed }: PracticeTextProps) {
  const { columns } = useWindowSize();
  const maxVisibleLines = 3;
  const promptWidth = Math.max(20, Math.min(72, columns - 8));

  if (prompt === "") {
    return <Text>Loading...</Text>;
  }

  const words = prompt.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentLineLength = 0;

  for (const word of words) {
    const nextLength =
      currentLine.length === 0
        ? word.length
        : currentLineLength + 1 + word.length;

    if (nextLength > promptWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [word];
      currentLineLength = word.length;
    } else {
      currentLine.push(word);
      currentLineLength = nextLength;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  let cursorLineIndex = 0;
  let charCount = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const lineLength = lines[index].join(" ").length;

    if (typed.length <= charCount + lineLength) {
      cursorLineIndex = index;
      break;
    }

    charCount += lineLength + 1;
    cursorLineIndex = index;
  }

  const startLineIndex = Math.max(0, cursorLineIndex - maxVisibleLines + 2);
  const visibleLines = lines.slice(
    startLineIndex,
    startLineIndex + maxVisibleLines,
  );

  let visibleStartIndex = 0;
  for (const line of lines.slice(0, startLineIndex)) {
    visibleStartIndex += line.join(" ").length + 1;
  }

  let charIndex = 0;

  return (
    <Box width={promptWidth} alignSelf="center" flexDirection="column">
      {visibleLines.map((line, lineIndex) => (
        <Text key={`line-${startLineIndex + lineIndex}`}>
          {line.map((word, wordIndex, wordsInLine) => {
            const wordWithSpace =
              wordIndex < wordsInLine.length - 1 ? `${word} ` : word;

            return (
              <Text key={`${startLineIndex + lineIndex}-${wordIndex}`}>
                {wordWithSpace.split("").map((char) => {
                  const currentIndex = visibleStartIndex + charIndex++;
                  const isTyped = currentIndex < typed.length;
                  const isCurrent = currentIndex === typed.length;

                  return (
                    <Text
                      key={`${startLineIndex + lineIndex}-${wordIndex}-${currentIndex}`}
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
            );
          })}
        </Text>
      ))}
    </Box>
  );
}
