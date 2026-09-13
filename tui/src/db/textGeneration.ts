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

// MonkeyType's own 4-tier quote-length convention. Each language's quote
// file carries its own `groups` array of [min, max] character-length
// ranges in this exact tier order - read from the file rather than
// hardcoded here, in case a language's ranges ever differ.
export type QuoteLength = "short" | "medium" | "long" | "extreme";

const QUOTE_LENGTH_GROUP_INDEX: Record<QuoteLength, number> = {
  short: 0,
  medium: 1,
  long: 2,
  extreme: 3,
};

interface LanguageFile {
  name: string;
  words: string[];
}

interface QuoteEntry {
  text: string;
  source: string;
  length: number;
  id: number;
}

interface QuoteFile {
  language: string;
  groups: number[][];
  quotes: QuoteEntry[];
}

const wordListCache = new Map<string, string[]>();
// null entry = confirmed no quote file for this language (cached so repeated
// lookups don't keep hitting the filesystem).
const quoteFileCache = new Map<string, QuoteFile | null>();

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

function loadQuoteFile(language: string): QuoteFile | null {
  const cached = quoteFileCache.get(language);
  if (cached !== undefined) return cached;

  const path = join(QUOTES_DIR, `${language}.json`);
  if (!existsSync(path)) {
    quoteFileCache.set(language, null);
    return null;
  }
  const data = JSON.parse(readFileSync(path, "utf-8")) as QuoteFile;
  quoteFileCache.set(language, data);
  return data;
}

// Quotes in a language file whose `length` falls in the requested tier's
// [min, max] range (from that file's own `groups`, not hardcoded).
function quotesInLengthBucket(file: QuoteFile, quoteLength: QuoteLength): QuoteEntry[] {
  const range = file.groups[QUOTE_LENGTH_GROUP_INDEX[quoteLength]];
  if (!range) return file.quotes;
  const [min, max] = range;
  return file.quotes.filter((quote) => quote.length >= min && quote.length <= max);
}

// Not every language MonkeyType ships words for also has a quote file -
// fall back to English quotes rather than throwing. Same degrade-gracefully
// spirit applies if a requested length bucket comes up empty for a (usually
// small) language file - fall back to that language's full quote list
// rather than returning nothing.
export function getRandomQuoteWithSource(
  language: string,
  quoteLength?: QuoteLength,
): { text: string; source: string } {
  let file = loadQuoteFile(language);
  if (!file || file.quotes.length === 0) {
    file = loadQuoteFile(DEFAULT_LANGUAGE);
  }
  if (!file || file.quotes.length === 0) return { text: "", source: "" };

  let pool = file.quotes;
  if (quoteLength) {
    const bucketed = quotesInLengthBucket(file, quoteLength);
    if (bucketed.length > 0) pool = bucketed;
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)]!;
  return { text: chosen.text, source: chosen.source };
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
  // solo endless mode, or TIME_MODE_WORD_BUFFER for multiplayer). Quote-mode
  // callers that also need the source should use getRandomQuoteWithSource
  // instead - this stays string-only so "words"/"time" callers keep a
  // stable return type.
  if (mode === "quote") return getRandomQuoteWithSource(language).text;
  return randomWords(count, language).join(" ");
}

export function generateMoreWords(
  n: number,
  language: string = DEFAULT_LANGUAGE,
): string {
  return randomWords(n, language).join(" ");
}
