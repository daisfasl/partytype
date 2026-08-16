import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';

export default function DashboardHeader() {
    return (
        <Box justifyContent='space-between'>
				<Gradient name='pastel'>
					<Text bold >partyType</Text>
				</Gradient>
				<Text dimColor >version 0.1</Text>
			</Box>
    );
}