import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Word/quote content lives as one JSON file per language, mirroring
// monkeytypegame/monkeytype's own layout (see ROADMAP Phase D/attribution in
// README) - not consolidated into a single file, since there's no longer a
// single "the" word list. Loaded from disk on demand and cached in-memory;
// nothing is read from SQLite anymore.
const SEED_DIR = join(dirname(fileURLToPath(import.meta.url)), "seed");
const LANGUAGES_DIR = join(SEED_DIR, "languages");
const QUOTES_DIR = join(SEED_DIR, "quotes");

export const DEFAULT_LANGUAGE = "english";

// Comfortably covers the full 300s multiplayer time cap at well beyond
// realistic WPM (see ROADMAP Phase C) — reused by the host when starting a
// multiplayer "time" mode race.
export const TIME_MODE_WORD_BUFFER = 1200;

type Mode = "words" | "time" | "quote";

interface LanguageFile {
  name: string;
  words: string[];
}

interface QuoteFile {
  language: string;
  quotes: { text: string }[];
}

const wordListCache = new Map<string, string[]>();
// null entry = confirmed no quote file for this language (cached so repeated
// lookups don't keep hitting the filesystem).
const quoteListCache = new Map<string, string[] | null>();

function loadWordList(language: string): string[] {
  const cached = wordListCache.get(language);
  if (cached) return cached;

  const path = join(LANGUAGES_DIR, `${language}.json`);
  if (!existsSync(path)) {
    throw new Error(`Unknown language: ${language}`);
  }
  const data = JSON.parse(readFileSync(path, "utf-8")) as LanguageFile;
  wordListCache.set(language, data.words);
  return data.words;
}

function loadQuoteList(language: string): string[] | null {
  const cached = quoteListCache.get(language);
  if (cached !== undefined) return cached;

  const path = join(QUOTES_DIR, `${language}.json`);
  if (!existsSync(path)) {
    quoteListCache.set(language, null);
    return null;
  }
  const data = JSON.parse(readFileSync(path, "utf-8")) as QuoteFile;
  const texts = data.quotes.map((quote) => quote.text);
  quoteListCache.set(language, texts);
  return texts;
}

// Not every language MonkeyType ships words for also has a quote file -
// fall back to English quotes rather than throwing.
function randomQuote(language: string): string {
  let quotes = loadQuoteList(language);
  if (!quotes || quotes.length === 0) {
    quotes = loadQuoteList(DEFAULT_LANGUAGE);
  }
  if (!quotes || quotes.length === 0) return "";
  return quotes[Math.floor(Math.random() * quotes.length)]!;
}

function randomWords(count: number, language: string): string[] {
  const words = loadWordList(language);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]!);
  }
  return result;
}

// Available language codes, derived from the bundled seed files - drives the
// Settings "Word list" cycler and (for multiplayer) the Lobby's language row.
export function getAvailableLanguages(): string[] {
  return readdirSync(LANGUAGES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length))
    .sort();
}

export function generateText(
  mode: Mode,
  count: number,
  language: string = DEFAULT_LANGUAGE,
): string {
  // "words" and "time" both resolve to N random words joined - the caller
  // decides what N means (a word-count setting, an initial local chunk for
  // solo endless mode, or TIME_MODE_WORD_BUFFER for multiplayer).
  if (mode === "quote") return randomQuote(language);
  return randomWords(count, language).join(" ");
}

export function generateMoreWords(
  n: number,
  language: string = DEFAULT_LANGUAGE,
): string {
  return randomWords(n, language).join(" ");
}
