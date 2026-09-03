export type Screen =
  | "home"
  | "practice"
  | "create-party"
  | "join-party"
  | "settings";

export type Status = "idle" | "typing" | "completed";

export type PracticeMode = "words" | "timed";

export type PracticeSettings = {
  numWords: number;
  mode: PracticeMode;
  timeLimit: number;
};

export type ApiStatus = "loading" | "online" | "offline";
