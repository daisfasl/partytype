import {Box, Text} from 'ink';
import Practice from './screens/Practice.js';

export default function App() {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Text bold color="cyan">partyType</Text>
			<Practice />
		</Box>
	);
}
