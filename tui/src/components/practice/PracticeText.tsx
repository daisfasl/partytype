import { Box, Text, useWindowSize } from "ink";

interface PracticeTextProps {
  prompt: string;
  typed: string;
}

export default function PracticeText({ prompt, typed }: PracticeTextProps) {
  const { columns } = useWindowSize();
  const promptWidth = Math.max(20, Math.min(columns - 4, columns));

  if (prompt === "") {
    return <Text>Loading...</Text>;
  }

  let charIndex = 0;
  return (
    <Box
      width={promptWidth}
      alignSelf="center"
      flexDirection="row"
      flexWrap="wrap"
    >
      {prompt.split(" ").map((word, wordIndex, words) => {
        const wordWithSpace = wordIndex < words.length - 1 ? `${word} ` : word;
        return (
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
        );
      })}
    </Box>
  );
}
