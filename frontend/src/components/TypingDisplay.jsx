

function TextDisplay({ targetWords, currentWordIndex, typedWord, completedWords }) {
    return (
        <div>
            {targetWords.map((word, index) => (
                <span key={index}>{word.split("").map((character, charIndex) => (<span key={charIndex}>{character}</span>))}
                {" "}
                </span>

            ))}
        </div>
    )
}

export default TextDisplay