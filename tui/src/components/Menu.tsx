import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface MenuProps {
  options: {
    label: string;
    value?: string;
    onSelect?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
  }[];
  direction?: "column" | "row";
}

export default function Menu({ options, direction = "column" }: MenuProps) {
  const [currMenu, setMenu] = useState(0);

  useInput((input, key) => {
    if (direction === "column") {
      if (key.upArrow) {
        if (currMenu > 0) {
          setMenu(currMenu - 1);
        }
      }
      if (key.downArrow) {
        if (currMenu < options.length - 1) {
          setMenu(currMenu + 1);
        }
      }
    }
    if (direction === "column" && (key.leftArrow || key.rightArrow)) {
      const selectedItem = options[currMenu];
      if (key.leftArrow) {
        selectedItem?.onLeft?.();
      } else {
        selectedItem?.onRight?.();
      }
    }
    if (direction === "row") {
      if (key.leftArrow) {
        if (currMenu > 0) {
          setMenu(currMenu - 1);
        }
      }
      if (key.rightArrow) {
        if (currMenu < options.length - 1) {
          setMenu(currMenu + 1);
        }
      }
    }
    if (key.return) {
      const selectedItem = options[currMenu];
      selectedItem?.onSelect?.();
    }
  });

  return (
    <Box
      marginTop={1}
      flexDirection={direction}
      gap={direction === "row" ? 2 : 0}
    >
      {options.map((menuOption, index) => {
        const isSelected = index === currMenu;
        const hasValueControls = menuOption.onLeft || menuOption.onRight;
        if (direction === "row" || !menuOption.value) {
          return (
            <Text key={menuOption.label} color={isSelected ? "white" : "gray"}>
              {isSelected ? "› " : "  "}
              {menuOption.label}
            </Text>
          );
        }

        return (
          <Box key={menuOption.label} width="100%">
            <Box flexGrow={1}>
              <Text color={isSelected ? "white" : "gray"}>
                {isSelected ? "› " : "  "}
                {menuOption.label}
              </Text>
            </Box>
            <Text dimColor={!isSelected}>
              {hasValueControls
                ? `← ${menuOption.value} →`
                : menuOption.value}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
