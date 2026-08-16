import { Text, useInput } from 'ink';

interface HomeProps {
	onNavigate: (screen: 'home' | 'practice') => void;
}

export default function Home({ onNavigate }: HomeProps) {
	useInput((input, key) => {
		if (input === 'p') {
			onNavigate('practice');
		}
	});
	
	return (
		<Text>Home test</Text>
	);
}