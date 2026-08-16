import {Box, Text} from 'ink';
import Header from '../src/components/Header.js';

export default function App() {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Header />
			<Text>This is a test</Text>
		</Box>
	);
}
