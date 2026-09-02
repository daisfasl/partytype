import { useCallback } from "react";
import useApi from "./useApiStatus.js";

export default function usePracticePrompt(numWords: number) {
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

  const { data, refetch } = useApi<{ words: string[] }>(requestPrompt);

  return {
    prompt: data?.words.join(" ") ?? "",
    fetchPrompt: refetch,
  };
}
