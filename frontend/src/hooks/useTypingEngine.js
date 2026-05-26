import { useEffect, useState } from "react"

function useTypingEngine() {
    const [targetWords] = useState("The quick brown fox jumps over the lazy dog test some long text test test test test test test test".split(" "))
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [typedWord, setTypedWord] = useState("")
    const [completedWords, setCompletedWords] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [wpm, setWPM] = useState(0)
    const [gameStatus, setGameStatus] = useState("waiting")

    useEffect(() => {
        if (!startTime) return

        const interval = setInterval(() => {
            const elapsedMinutes = (Date.now() - startTime) / 60000
            const wordsTyped = completedWords.length
            setWPM(Math.round(wordsTyped / elapsedMinutes))
        }, 500)

        return () => clearInterval(interval)
    }, [startTime, completedWords])


    function reset(){
        setCurrentWordIndex(0)
        setCompletedWords([])
        setTypedWord("")
        setStartTime(null)
        setGameStatus("waiting")
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault()
            reset()
        }
        if (e.key === "Shift" || e.key === "CapsLock" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
            return
        }

        const isSystemShortcut = e.ctrlKey || e.metaKey || e.altKey;

        if (startTime === null && !isSystemShortcut) {
            setStartTime(Date.now())
            setGameStatus("playing")
        }
        if (e.key === " ") {
            e.preventDefault()

            if (typedWord.trim() === "") return

            setCompletedWords([...completedWords, typedWord])
            setCurrentWordIndex(currentWordIndex + 1)
            setTypedWord("")
            return
        }
        if (e.key === "Backspace") {
            if (typedWord === "" && currentWordIndex === 0) return
            if (typedWord == "" && currentWordIndex > 0) {
                setTypedWord(completedWords[completedWords.length - 1])
                setCompletedWords(completedWords.slice(0, -1))
                setCurrentWordIndex(currentWordIndex - 1)
            } else {
                setTypedWord(typedWord.slice(0, -1))
            }
        }
        if (e.key.length === 1 && typedWord.length < 20) {
            setTypedWord(typedWord + e.key)
        }

    }
    return { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown, wpm, gameStatus, reset }
}

export default useTypingEngine