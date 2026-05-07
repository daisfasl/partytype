import { useState } from 'react'
import useTypingEngine from './hooks/useTypingEngine';
import TypingDisplay from './components/TypingDisplay';
import { useRef, useEffect } from 'react'


function App() {
    const inputRef = useRef(null)
    const { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown } = useTypingEngine()

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    console.log({ currentWordIndex, typedWord, completedWords })

    return (
        <div onClick={() => inputRef.current.focus()} className="min-h-screen w-full bg-[#323437] flex items-center justify-center">
            <TypingDisplay targetWords={targetWords} currentWordIndex={currentWordIndex}
                typedWord={typedWord} completedWords={completedWords} />
            <input ref={inputRef} onKeyDown={handleKeyDown} className="opacity-0 absolute cursor-default" />

        </div>
    )
}

export default App