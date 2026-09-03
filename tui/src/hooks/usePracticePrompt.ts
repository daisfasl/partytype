import { useCallback, useState } from "react";

export default function usePracticePrompt(numWords: number) {
  const [prompt, setPrompt] = useState("");

  const requestPrompt = useCallback(() => {
    const params = new URLSearchParams({
      dataset_file: "english.json",
      num_words: String(numWords),
    });

    return fetch(`http://localhost:8000/api/words?${params}`).then(
      (response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to fetch practice words (${response.status})`,
          );
        }
        return response.json() as Promise<{ words: string[] }>;
      },
    );
  }, [numWords]);

  const fetchPrompt = useCallback(() => {
    return requestPrompt().then((data) => {
      const nextPrompt = data.words.join(" ");
      setPrompt(nextPrompt);
      return nextPrompt;
    });
  }, [requestPrompt]);

  const appendPrompt = useCallback(() => {
    return requestPrompt().then((data) => {
      const nextWords = data.words.join(" ");
      setPrompt((current) =>
        current ? `${current} ${nextWords}`.trim() : nextWords,
      );
      return nextWords;
    });
  }, [requestPrompt]);

  return {
    prompt,
    fetchPrompt,
    appendPrompt,
  };
}
