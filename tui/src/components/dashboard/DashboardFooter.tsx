import { Box, Text } from 'ink';

export default function DashboardFooter() {
    return (
        <Box
            borderStyle='single'
            borderTop={true}
            borderBottom={false}
            borderLeft={false}
            borderRight={false}
            borderColor='gray'
            paddingX={1}
            marginTop={1}
            justifyContent='space-between'
        >
            <Text color='red' >offline</Text>
            {/* online when connected to API */}
            <Text dimColor>↑↓ select · enter open · q quit</Text>
        </Box>
    )
}