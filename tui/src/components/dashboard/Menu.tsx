import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

interface MenuProps {
    onNavigate: (screen: 'home' | 'practice') => void;
}

export default function Menu({ onNavigate }: MenuProps) {

    const [currMenu, setMenu] = useState(0);
    const menuOptions = ["Practice", "Create a party", "Join a party", "Settings"]

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
    });

    return (
        <Box flexDirection='column'>
            {/* Welcome Message */}
            <Box flexDirection='column' marginTop={1}>
                <Text>Welcome.</Text>
                <Text>How would you like to type?</Text>
            </Box>

            {/* Menu Options */}
            <Box marginTop={1} flexDirection='column'>
                {menuOptions.map((menuOption, index) =>
                    ((index === currMenu) ? <Text>{'› '}{menuOption} </Text> : <Text>{menuOption}</Text>))}
            </Box>
        </Box>
    );
}