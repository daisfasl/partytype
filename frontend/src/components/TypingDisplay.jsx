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
        <div className="w-full max-w-6xl mx-auto px-4 text-2xl leading-relaxed text-center select-none">
            {targetWords.map((word, wordIndex) => {
                const isCurrentWord = wordIndex === currentWordIndex;
                const activeTypedString = isCurrentWord ? typedWord : (completedWords[wordIndex] || "");
                
                const targetChars = word.split("");
                const totalLength = Math.max(targetChars.length, activeTypedString.length);
                const displayArray = Array.from({ length: totalLength }, (_, i) => targetChars[i] || "");

                return (
                    <span key={wordIndex}>
                        {displayArray.map((character, charIndex) => {
                            const typedChar = activeTypedString[charIndex];
                            
                            return (
                                <React.Fragment key={charIndex}>
                                    {charIndex === activeTypedString.length && isCurrentWord && (
                                        <span className="blinking-cursor"></span>
                                    )}
                                    
                                    <span className={getCharClass(wordIndex, charIndex, character, typedChar, word)}>
                                        {character || typedChar}
                                    </span>
                                </React.Fragment>
                            );
                        })}
                        {isCurrentWord && activeTypedString.length >= displayArray.length && (
                            <span className="blinking-cursor"></span>
                        )}
                        {" "}
                    </span>
                );
            })}
        </div>
    )
}

export default TextDisplay