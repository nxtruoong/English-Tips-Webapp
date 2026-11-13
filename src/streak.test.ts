import { describe, expect, it } from 'vitest';
import { addDays, adjustStudyDay, currentStreak, dayKey, longestStreak } from './streak';
import { validateData } from './storage';
import { emptyData } from './domain';

const days = (...keys: string[]) => Object.fromEntries(keys.map(key => [key, 1]));

describe('day keys', () => {
  it('uses Vietnam calendar dates regardless of UTC time', () => {
    // 18:30 UTC is already the next day in Vietnam (UTC+7).
    expect(dayKey(new Date('2026-11-12T18:30:00Z'))).toBe('2026-11-13');
    expect(dayKey(new Date('2026-11-12T16:59:00Z'))).toBe('2026-11-12');
  });
  it('shifts across month and year boundaries', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('streaks', () => {
  const today = '2026-11-13';
  it('counts consecutive days ending today', () => {
    expect(currentStreak(days('2026-11-11', '2026-11-12', '2026-11-13'), today)).toBe(3);
  });
  it('keeps yesterday’s streak alive until today ends', () => {
    expect(currentStreak(days('2026-11-11', '2026-11-12'), today)).toBe(2);
  });
  it('breaks after a missed day', () => {
    expect(currentStreak(days('2026-11-10', '2026-11-11'), today)).toBe(0);
    expect(currentStreak(days('2026-11-09', '2026-11-11', '2026-11-12', '2026-11-13'), today)).toBe(3);
    expect(currentStreak({}, today)).toBe(0);
  });
  it('finds the longest run, including across months', () => {
    expect(longestStreak(days('2026-10-30', '2026-10-31', '2026-11-01', '2026-11-05'))).toBe(3);
    expect(longestStreak({})).toBe(0);
  });
  it('adds and removes counts, dropping empty days', () => {
    const once = adjustStudyDay({}, today, 1);
    expect(once).toEqual({ [today]: 1 });
    expect(adjustStudyDay(once, today, 2)).toEqual({ [today]: 3 });
    expect(adjustStudyDay(once, today, -1)).toEqual({});
    expect(adjustStudyDay({}, today, -1)).toEqual({});
  });
});

describe('study-day backups', () => {
  it('defaults study days and goal for backups made before they existed', () => {
    const old = validateData({ schema: 1, attempts: [], saved: [], lessons: {} });
    expect(old.studyDays).toEqual({});
    expect(old.dailyGoal).toBe(emptyData().dailyGoal);
  });
  it('round-trips study days and goal, dropping zero counts', () => {
    const value = validateData({
      ...emptyData(),
      studyDays: { '2026-11-12': 2, '2026-11-13': 0 },
      dailyGoal: 3,
    });
    expect(value.studyDays).toEqual({ '2026-11-12': 2 });
    expect(value.dailyGoal).toBe(3);
  });
  it('rejects malformed days and goals', () => {
    expect(() => validateData({ ...emptyData(), studyDays: { yesterday: 1 } })).toThrow();
    expect(() => validateData({ ...emptyData(), studyDays: { '2026-11-12': -1 } })).toThrow();
    expect(() => validateData({ ...emptyData(), studyDays: { '2026-11-12': 1.5 } })).toThrow();
    expect(() => validateData({ ...emptyData(), dailyGoal: 99 })).toThrow();
  });
});
