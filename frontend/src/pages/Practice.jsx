import useTypingEngine from '../hooks/useTypingEngine'
import TypingDisplay from '../components/TypingDisplay'
import { useRef, useEffect } from 'react'
import WPMDisplay from '../components/WPMDisplay'
import NavBar from '../components/NavBar'


function Practice() {
    const inputRef = useRef(null)
    const { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown, wpm, gameStatus} = useTypingEngine()

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    return (
        <div onClick={() => inputRef.current.focus()} className="h-screen overflow-hidden w-full bg-[#323437] flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <NavBar gameStatus={gameStatus} />
                <TypingDisplay targetWords={targetWords} currentWordIndex={currentWordIndex}
                    typedWord={typedWord} completedWords={completedWords} />
            </div>
            <div className="absolute bottom-12 left-0 w-full flex justify-center pointer-events-none">
                <WPMDisplay wpm={Math.round(wpm)} />
            </div>
            <input ref={inputRef} onKeyDown={handleKeyDown} className="opacity-0 absolute cursor-default" />
            {console.log("typedWord:", typedWord)}
        </div>
    )
}

export default Practice