import { useState } from "react"

function useTypingEngine() {
    const [targetWords] = useState("The quick brown fox jumps over the lazy dog".split(" "))
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [typedWord, setTypedWord] = useState("")
    const [completedWords, setCompletedWords] = useState([])

    function handleKeyDown(e) {
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
    return { targetWords, currentWordIndex, typedWord, completedWords, handleKeyDown }
}

export default useTypingEngine