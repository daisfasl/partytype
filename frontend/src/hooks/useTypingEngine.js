import { useEffect, useState } from "react"

function useTypingEngine() {
    const [targetWords] = useState("The quick brown fox jumps over the lazy dog test some long text".split(" "))
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [typedWord, setTypedWord] = useState("")
    const [completedWords, setCompletedWords] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [wpm, setWPM] = useState(0)

    useEffect(() => {
            if (startTime) {
                const elapsedTime = (Date.now() - startTime) / 1000
                const wordsPerMinute = (completedWords.length / elapsedTime) * 60
                setWPM(wordsPerMinute)
            }
        }, [completedWords, startTime]
    )

    function handleKeyDown(e) {
        if (startTime === null) setStartTime(Date.now())
        if (e.key == " ") {
            e.preventDefault()
            setTypedWord("")
            setCurrentWordIndex(currentWordIndex + 1)
            setCompletedWords([...completedWords, typedWord])
        } else if (e.key == "Backspace") {
            if (typedWord === "" && currentWordIndex === 0) return
            if (typedWord == "" && currentWordIndex > 0) {
                setTypedWord(completedWords[completedWords.length - 1])
                setCompletedWords(completedWords.slice(0, -1))
                setCurrentWordIndex(currentWordIndex - 1)
            } else {
                setTypedWord(typedWord.slice(0, -1))
            }
        } else {
            if (e.key.length === 1 && typedWord.length < targetWords[currentWordIndex].length) {
                setTypedWord(typedWord + e.key)
            }
        }
    }
    return { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown, wpm }
}

export default useTypingEngine