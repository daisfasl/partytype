import { useState } from 'react'
import useTypingEngine from './hooks/useTypingEngine';


function App() {
    const { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown } = useTypingEngine()

    console.log({ currentWordIndex, typedWord, completedWords })

    return (
        <div className="min-h-screen w-full bg-[#323437] flex items-center justify-center">
            <input value={typedWord} onKeyDown={handleKeyDown} className="border border-white" />
        </div>
    )
}

export default App