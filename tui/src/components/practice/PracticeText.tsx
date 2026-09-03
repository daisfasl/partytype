import { Text } from "ink";

interface PracticeTextProps {
  prompt: string;
  typed: string;
}

const CORRECT_COLOR = "#a6e3a1";
const INCORRECT_COLOR = "#f38ba8";

export default function PracticeText({ prompt, typed }: PracticeTextProps) {
  if (prompt === "") {
    return <Text>Loading...</Text>;
  }

  const getCharColor = (isTyped: boolean, isCorrect: boolean) => {
    if (!isTyped) return undefined;
    return isCorrect ? CORRECT_COLOR : INCORRECT_COLOR;
  };

  return (
    <Text>
      {prompt.split("").map((char, index) => {
        const isTyped = index < typed.length;
        const isCurrent = index === typed.length;
        const isCorrect = typed[index] === char;

        return (
          <Text
            key={`char-${index}`}
            color={getCharColor(isTyped, isCorrect)}
            inverse={isCurrent} // Highlights the cursor block
            dimColor={!isTyped && !isCurrent} // Dims untyped future text
          >
            {char}
          </Text>
        );
      })}
    </Text>
  );
}
