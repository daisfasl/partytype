import React from 'react'

function TextDisplay({ targetWords, currentWordIndex, typedWord, completedWords }) {

    function getCharClass(wordIndex, charIndex, character, typedChar, originalWord) {
        if (wordIndex < currentWordIndex) {
            const historicalWord = completedWords[wordIndex] || "";
            if (charIndex >= originalWord.length) return "incorrect";

            return historicalWord[charIndex] === originalWord[charIndex]
                ? "correct"
                : "incorrect";
        }

        if (wordIndex === currentWordIndex) {
            if (typedChar === undefined) return "pending";
            if (charIndex >= originalWord.length) return "incorrect";
            return typedChar === character ? "correct" : "incorrect";
        }

        return "pending";
    }

    return (

        <div className="relative w-full max-w-6xl mx-auto px-4">
            <div
                className="
                    flex flex-wrap gap-x-4
                    justify-center text-center h-24 overflow-hidden 
                    select-none text-3xl font-mono 
                "
            >
                {targetWords.map((word, wordIndex) => {
                    const isCurrentWord = wordIndex === currentWordIndex;
                    const activeTypedString = isCurrentWord ? typedWord : (completedWords[wordIndex] || "");

                    const targetChars = word.split("");
                    const totalLength = Math.max(targetChars.length, activeTypedString.length);
                    const displayArray = Array.from({ length: totalLength }, (_, i) => targetChars[i] || "");

                    return (
                        <div
                            key={wordIndex}
                            className={`relative inline-block whitespace-nowrap ${isCurrentWord ? 'active-word' : ''}`}
                        >
                            {displayArray.map((character, charIndex) => {
                                const typedChar = activeTypedString[charIndex];

                                return (
                                    <React.Fragment key={charIndex}>
                                        {charIndex === activeTypedString.length && isCurrentWord && (
                                            <span className="absolute blinking-cursor"></span>
                                        )}

                                        <span className={getCharClass(wordIndex, charIndex, character, typedChar, word)}>
                                            {character || typedChar}
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                            {isCurrentWord && activeTypedString.length >= displayArray.length && (
                                <span className="absolute blinking-cursor"></span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default TextDisplay