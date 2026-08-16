import { Box, Text, useInput } from 'ink';

export default function Menu() {
    return (
        <Box flexDirection='column'>
            {/* Welcome Message */}
            <Box flexDirection='column' marginTop={1}>
                <Text>Welcome.</Text>
                <Text>How would you like to type?</Text>
            </Box>

            {/* Menu Options */}
            <Box marginTop={1} flexDirection='column'>
                <Text>{'›'} Practice</Text>
                <Text>{' '}Create a party</Text>
                <Text>{' '}Join a party</Text>
                <Text>{' '}Settings</Text>
            </Box>
        </Box>
    );
}