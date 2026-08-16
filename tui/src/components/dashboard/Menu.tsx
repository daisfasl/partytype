import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { Screen } from "../../types.js";

interface MenuProps {
  onNavigate: (screen: Screen) => void;
}

export default function Menu({ onNavigate }: MenuProps) {
  const [currMenu, setMenu] = useState(0);
  const menuOptions: { label: string; screen: Screen }[] = [
    { label: "Practice Mode", screen: "practice" },
    { label: "Create a Party", screen: "create-party" },
    { label: "Join a Party", screen: "join-party" },
    { label: "Settings", screen: "settings" },
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      if (currMenu > 0) {
        setMenu(currMenu - 1);
      }
    }
    if (key.downArrow) {
      if (currMenu < menuOptions.length - 1) {
        setMenu(currMenu + 1);
      }
    }
    if (key.return) {
      const selectedItem = menuOptions[currMenu];
      if (selectedItem) {
        onNavigate(selectedItem.screen);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {/* Welcome Message */}
      <Box flexDirection="column" marginTop={1}>
        <Text>Welcome.</Text>
        <Text>How would you like to type?</Text>
      </Box>

      {/* Menu Options */}
      <Box marginTop={1} flexDirection="column">
        {menuOptions.map((menuOption, index) => {
          const isSelected = index === currMenu;
          return (
            <Text key={menuOption.screen} color={isSelected ? "white" : "gray"}>
              {isSelected ? "› " : ""}
              {menuOption.label}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
}
