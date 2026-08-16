import { Text } from "ink";

interface PracticeProps {
  onNavigate: (screen: "home" | "practice") => void;
}

export default function Practice({ onNavigate }: PracticeProps) {
  return <Text>Practice test</Text>;
}
