import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
// words.json: google-10000-english (MIT). quotes.json: quotable-io/data (MIT),
// sampled down to ~400 entries and filtered to <=300 chars at fetch time.
import wordsSeed from "./seed/words.json" with { type: "json" };
import quotesSeed from "./seed/quotes.json" with { type: "json" };

// Lives next to config.json rather than bundled with the binary, so stats
// survive reinstalls/upgrades. Content tables are re-checked (not
// re-inserted) on every launch, so this file also works fine deleted.
const CONFIG_DIR = join(homedir(), ".config", "partytype");
const DB_PATH = join(CONFIG_DIR, "partytype.db");

let db: Database | null = null;

export default function getDb(): Database {
  if (db) return db;

  mkdirSync(CONFIG_DIR, { recursive: true });
  db = new Database(DB_PATH, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");

  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS personal_bests (
      mode TEXT NOT NULL,
      setting_value INTEGER,
      wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      PRIMARY KEY (mode, setting_value)
    )
  `);

  seedIfEmpty(db);

  return db;
}

function seedIfEmpty(database: Database) {
  const wordCount = database
    .query("SELECT COUNT(*) as count FROM words")
    .get() as { count: number };
  if (wordCount.count === 0) {
    const insert = database.prepare("INSERT INTO words (word) VALUES (?)");
    const insertAll = database.transaction((words: string[]) => {
      for (const word of words) insert.run(word);
    });
    insertAll(wordsSeed as string[]);
  }

  const quoteCount = database
    .query("SELECT COUNT(*) as count FROM quotes")
    .get() as { count: number };
  if (quoteCount.count === 0) {
    const insert = database.prepare(
      "INSERT INTO quotes (content, author) VALUES (?, ?)",
    );
    const insertAll = database.transaction(
      (quotes: { content: string; author: string }[]) => {
        for (const quote of quotes) insert.run(quote.content, quote.author);
      },
    );
    insertAll(quotesSeed as { content: string; author: string }[]);
  }
}
