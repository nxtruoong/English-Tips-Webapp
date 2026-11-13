// Study days, streaks and the daily goal. Days are calendar dates in Vietnam time
// (UTC+7, same offset as Asia/Bangkok), stored as YYYY-MM-DD keys.

/** A day counts as studied after this many completed lesson steps or practice attempts. */
export const goalOptions = [1, 2, 3] as const;
export const defaultDailyGoal = 1;
/** Rough session length for one lesson step, shown next to the goal. */
export const minutesPerStep = 20;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function dayKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}
export function isDayKey(value: string): boolean {
  return DAY.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}
/** Shift a day key by whole days; independent of the device's time zone. */
export function addDays(key: string, days: number): string {
  return new Date(Date.parse(`${key}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Change the count of finished study actions for a day. Undoing an action on the
 * same day (unmarking a step) lowers it again; a day at zero is removed.
 */
export function adjustStudyDay(
  days: Record<string, number>,
  key: string,
  delta: number,
): Record<string, number> {
  const value = Math.max(0, (days[key] || 0) + delta);
  const next = { ...days };
  if (value) next[key] = value;
  else delete next[key];
  return next;
}

/**
 * Consecutive studied days ending today. A streak stays alive until the end of
 * today even when today has no study yet, so it counts back from yesterday.
 */
export function currentStreak(days: Record<string, number>, today: string): number {
  let day = days[today] ? today : addDays(today, -1);
  let count = 0;
  while ((days[day] || 0) > 0) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function longestStreak(days: Record<string, number>): number {
  const studied = Object.keys(days)
    .filter(key => days[key] > 0)
    .sort();
  let best = 0;
  let run = 0;
  studied.forEach((key, i) => {
    run = i > 0 && addDays(studied[i - 1], 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

export function isGoal(value: unknown): value is number {
  return typeof value === 'number' && goalOptions.some(option => option === value);
}
