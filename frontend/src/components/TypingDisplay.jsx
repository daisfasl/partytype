

function TextDisplay({ targetWords, currentWordIndex, typedWord, completedWords }) {
    function getCharClass(wordIndex, charIndex, character) {
        if (wordIndex < currentWordIndex) {
            if (completedWords[wordIndex][charIndex] === targetWords[wordIndex][charIndex]) {
                return "text-emerald-500"
            } else {
                return "text-red-500"
            }
        } else if (wordIndex === currentWordIndex) {
            if (typedWord[charIndex] === undefined) return "pending"
            if (typedWord[charIndex] === character) return "text-emerald-500"
            return "text-red-500"
        } else {
            return "pending"
        }

    }
    return (
        <div>
            {targetWords.map((word, wordIndex) => (
            <span key={wordIndex}>{word.split("").map((character, charIndex) =>
                (<span className={getCharClass(wordIndex, charIndex, character)} key={charIndex}>{character}</span>))}
                {" "}
            </span>

            ))}
        </div>
    )
}

export default TextDisplay