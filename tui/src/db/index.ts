import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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

  // Content (words/quotes) used to live in SQLite tables seeded from a
  // single-file words.json/quotes.json. It's now read directly from the
  // per-language JSON seed files (see textGeneration.ts) - drop the old
  // tables. Pre-release software, no user data at stake.
  db.run(`DROP TABLE IF EXISTS words`);
  db.run(`DROP TABLE IF EXISTS quotes`);

  db.run(`
    CREATE TABLE IF NOT EXISTS personal_bests (
      mode TEXT NOT NULL,
      setting_value INTEGER,
      wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      PRIMARY KEY (mode, setting_value)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS test_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      completed_at TEXT NOT NULL,
      mode TEXT NOT NULL,
      wpm REAL NOT NULL,
      accuracy REAL NOT NULL
    )
  `);

  return db;
}
