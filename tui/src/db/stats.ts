import getDb from "./index.js";

type Mode = "words" | "time" | "quote";

type Best = { wpm: number; accuracy: number };

// SQLite treats NULL as distinct from NULL in a UNIQUE/PRIMARY KEY, so
// upserting quote-mode rows (settingValue === null) via ON CONFLICT would
// never match the existing row and just keep inserting duplicates. Look the
// row up manually instead of relying on a SQL-level upsert.
export function getBest(mode: Mode, settingValue: number | null): Best | null {
  const db = getDb();
  const row = db
    .query(
      `SELECT wpm, accuracy FROM personal_bests
       WHERE mode = ? AND setting_value IS ?`,
    )
    .get(mode, settingValue) as Best | null;
  return row ?? null;
}

export function recordResult(
  mode: Mode,
  settingValue: number | null,
  wpm: number,
  accuracy: number,
): void {
  const db = getDb();
  const existing = getBest(mode, settingValue);

  if (existing && existing.wpm >= wpm) return;

  if (existing) {
    db.run(
      `UPDATE personal_bests SET wpm = ?, accuracy = ?
       WHERE mode = ? AND setting_value IS ?`,
      [wpm, accuracy, mode, settingValue],
    );
  } else {
    db.run(
      `INSERT INTO personal_bests (mode, setting_value, wpm, accuracy)
       VALUES (?, ?, ?, ?)`,
      [mode, settingValue, wpm, accuracy],
    );
  }
}
