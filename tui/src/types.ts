export type Screen =
  | "home"
  | "practice"
  | "create-party"
  | "join-party"
  | "settings";

export type Status = "idle" | "typing" | "completed";

export type PracticeSettings = {
  numWords: number;
};
