import { useCallback, useEffect, useState } from "react";

export default function usePracticePrompt(numWords: number) {
  const [prompt, setPrompt] = useState("");

  const fetchPrompt = useCallback(() => {
    const params = new URLSearchParams({
      dataset_file: "english.json",
      num_words: String(numWords),
    });

    fetch(`http://localhost:8000/api/words?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to fetch practice words (${response.status})`);
        }
        return response.json() as Promise<{ words: string[] }>;
      })
      .then((data) => setPrompt(data.words.join(" ")))
      .catch((error) => console.error(error));
  }, [numWords]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return { prompt, fetchPrompt };
}
