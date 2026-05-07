import { useState } from 'react'
import useTypingEngine from './hooks/useTypingEngine';
import TypingDisplay from './components/TypingDisplay';

function App() {
    const { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown } = useTypingEngine()

    console.log({ currentWordIndex, typedWord, completedWords })

    return (
        <div className="min-h-screen w-full bg-[#323437] flex items-center justify-center">
            <TypingDisplay targetWords={targetWords} currentWordIndex={currentWordIndex}
                typedWord={typedWord} completedWords={completedWords} />
            <input value={typedWord} onKeyDown={handleKeyDown} className="opacity-0 absolute" />

        </div>
    )
}

export default App