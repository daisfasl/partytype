import React from 'react'

function TextDisplay({ targetWords, currentWordIndex, typedWord, completedWords }) {
    function getCharClass(wordIndex, charIndex, character) {
        if (wordIndex < currentWordIndex) {
            if (completedWords[wordIndex][charIndex] === targetWords[wordIndex][charIndex]) {
                return "text-emerald-500"
            } else {
                return "incorrect"
            }
        } else if (wordIndex === currentWordIndex) {
            if (typedWord[charIndex] === undefined) return "pending"
            if (typedWord[charIndex] === character) return "text-emerald-500"
            return "incorrect"
        } else {
            return "pending"
        }

    }
    return (
       <div className="w-full px-16 text-2xl leading-relaxed text-center">
            {targetWords.map((word, wordIndex) => (
                <span key={wordIndex}>{word.split("").map((character, charIndex) => (
                    <React.Fragment key={charIndex}>
                        {charIndex === typedWord.length && wordIndex === currentWordIndex && (
                            <span className="blinking-cursor">|</span>
                        )}
                        <span className={getCharClass(wordIndex, charIndex, character)}>
                            {character}
                        </span>
                    </React.Fragment>
                ))}
                    {wordIndex === currentWordIndex && typedWord.length === word.length && (
                        <span className="blinking-cursor">|</span>
                    )}
                {" "}
                </span>
            ))}
        </div>
    )
}

export default TextDisplay