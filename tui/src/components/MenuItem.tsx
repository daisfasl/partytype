import { Box, Text } from "ink";

export interface MenuActions {
  onSelect?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export interface MenuItemProps {
  label: string;
  value?: string;
  isSelected?: boolean;
  direction?: "column" | "row";
  menuIndex?: number;
  registerActions?: (actions: MenuActions) => void;
  onSelect?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export default function MenuItem({
  label,
  value,
  isSelected = false,
  direction = "column",
  onLeft,
  onRight,
}: MenuItemProps) {
  const labelContent = (
    <Text color={isSelected ? "white" : "gray"}>
      {isSelected ? "› " : "  "}
      {label}
    </Text>
  );

  if (direction === "row" || !value) {
    return <Box>{labelContent}</Box>;
  }

  return (
    <Box width="100%">
      <Box flexGrow={1}>{labelContent}</Box>
      <Text dimColor={!isSelected}>
        {onLeft || onRight ? `← ${value} →` : value}
      </Text>
    </Box>
  );
}
