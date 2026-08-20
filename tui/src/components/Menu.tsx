import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { Screen } from "../types.js";

interface MenuProps {
  options: { label: string; onSelect: () => void }[];
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
      if (selectedItem) {
        selectedItem.onSelect();
      }
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
        return (
          <Text key={menuOption.label} color={isSelected ? "white" : "gray"}>
            {isSelected ? "› " : "  "}
            {menuOption.label}
          </Text>
        );
      })}
    </Box>
  );
}
