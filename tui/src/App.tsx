import { useState } from 'react';
import Home from './screens/Home.js';
import Practice from './screens/Practice.js';


export default function App() {
	const [currentScreen, setScreen] = useState('home');


	if (currentScreen === 'home') {
		return (<Home />)
	} else if (currentScreen == 'practice') {
		return (<Practice />)
	}
} 

