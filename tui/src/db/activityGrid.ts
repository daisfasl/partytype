import type { ActivityDay } from "./stats.js";

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface ActivityCell {
  date: string;
  count: number;
  level: ActivityLevel;
}

// Buckets a raw test count into a 0-4 intensity level for coloring.
// 0 = no tests, 1-4 = increasing activity. Thresholds are a reasonable
// starting point, not tuned against real usage data.
export function countToLevel(count: number): ActivityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Builds a `weeks`-long array of 7-day columns (Monday-first), each cell
// carrying the raw count and bucketed level for that UTC calendar day.
// Columns run left-to-right chronologically, oldest first, ending on
// today (UTC). Days absent from `activity` (no tests that day) become
// level 0.
export function buildActivityGrid(
  activity: ActivityDay[],
  weeks: number,
): ActivityCell[][] {
  const countByDate = new Map(activity.map((a) => [a.date, a.count]));

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  // ISO day-of-week: Monday = 0 ... Sunday = 6.
  const isoDow = (todayUtc.getUTCDay() + 6) % 7;

  // Find the Monday of the current week, then walk back `weeks - 1` more
  // full weeks so the grid ends on today's column.
  const currentWeekMonday = new Date(todayUtc);
  currentWeekMonday.setUTCDate(currentWeekMonday.getUTCDate() - isoDow);

  const firstMonday = new Date(currentWeekMonday);
  firstMonday.setUTCDate(firstMonday.getUTCDate() - (weeks - 1) * 7);

  const grid: ActivityCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: ActivityCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(firstMonday);
      day.setUTCDate(day.getUTCDate() + w * 7 + d);
      if (day > todayUtc) {
        // Future day within today's partial week - render as empty rather
        // than omitting, so every column stays 7 cells tall.
        column.push({ date: toUtcDateString(day), count: 0, level: 0 });
        continue;
      }
      const dateStr = toUtcDateString(day);
      const count = countByDate.get(dateStr) ?? 0;
      column.push({ date: dateStr, count, level: countToLevel(count) });
    }
    grid.push(column);
  }

  return grid;
}
