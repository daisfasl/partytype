import { useState } from 'react'
import useTypingEngine from './hooks/useTypingEngine';
import TypingDisplay from './components/TypingDisplay';
import { useRef, useEffect } from 'react'
import WPMDisplay from './components/WPMDisplay';


function App() {
    const inputRef = useRef(null)
    const { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown, wpm } = useTypingEngine()

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    console.log({ currentWordIndex, typedWord, completedWords })

    return (
        <div onClick={() => inputRef.current.focus()} className="h-screen overflow-hidden w-full bg-[#323437] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 w-full">
                <WPMDisplay wpm={Math.round(wpm)} />
                <TypingDisplay targetWords={targetWords} currentWordIndex={currentWordIndex}
                    typedWord={typedWord} completedWords={completedWords} />
            </div>
            <input ref={inputRef} onKeyDown={handleKeyDown} className="opacity-0 absolute cursor-default" />
        </div>
    )
}

export default App