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

  // Every completed test gets logged here regardless of whether it's a
  // personal best - this is a full history, not just bests.
  db.run(
    `INSERT INTO test_history (completed_at, mode, wpm, accuracy)
     VALUES (?, ?, ?, ?)`,
    [new Date().toISOString(), mode, wpm, accuracy],
  );

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

export function getTotalTestsCompleted(): number {
  const db = getDb();
  const row = db.query(`SELECT COUNT(*) as count FROM test_history`).get() as {
    count: number;
  };
  return row.count;
}

export interface ActivityDay {
  date: string;
  count: number;
}

// Tests per UTC calendar day for the last `days` days. Only returns days
// that have at least one test - the caller fills in gaps (see
// buildActivityGrid in activityGrid.ts).
export function getActivity(days: number): ActivityDay[] {
  const db = getDb();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db
    .query(
      `SELECT date(completed_at) as date, COUNT(*) as count
       FROM test_history
       WHERE completed_at >= ?
       GROUP BY date(completed_at)`,
    )
    .all(cutoff) as ActivityDay[];
}
