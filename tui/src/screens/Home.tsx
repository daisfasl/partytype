import { Box, Text, useInput } from 'ink';
import Gradient from 'ink-gradient';

interface HomeProps {
	onNavigate: (screen: 'home' | 'practice') => void;
}

export default function Home({ onNavigate }: HomeProps) {
	return (
		<Box 
            width="100%" 
            height="100%" 
            alignItems="center" 
            justifyContent="center"
        >
		<Box flexDirection='column' borderStyle='round' width={60} paddingX={1} >
			<Box justifyContent='space-between'>
				<Gradient name='pastel'>
					<Text bold >partyType</Text>
				</Gradient>
				<Text dimColor >version 0.1</Text>
			</Box>
			<Box flexDirection='column' marginTop={1}>
				<Text>Welcome.</Text>
				<Text>How would you like to type?</Text>
			</Box>
			<Box marginTop={1} flexDirection='column'>
				<Text>{'›'} Practice</Text>
				<Text>{' '}Create a party</Text>
				<Text>{' '}Join a party</Text>
				<Text>{' '}Settings</Text>
			</Box>
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
		</Box>
		</Box>
	);
}