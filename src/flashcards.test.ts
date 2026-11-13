import { describe, expect, it } from 'vitest';
import { cleanInput, dueCards, findWord, newCard, reviewCard, type Flashcard } from './flashcards';
import { validateData } from './storage';
import { emptyData } from './domain';

const today = '2026-11-13';
const card = (patch: Partial<Flashcard> = {}): Flashcard => ({
  ...newCard({ word: 'carry out', meaning: 'thực hiện', example: '' }, today),
  ...patch,
});

describe('flashcard schedule', () => {
  it('makes new cards due the day they are added', () => {
    const fresh = card();
    expect(fresh.level).toBe(0);
    expect(fresh.due).toBe(today);
    expect(dueCards([fresh], today)).toHaveLength(1);
  });
  it('steps through 1, 3, 7, 14 and 30 days while remembered', () => {
    let current = card();
    const gaps: string[] = [];
    for (let i = 0; i < 6; i++) {
      current = reviewCard(current, true, today);
      gaps.push(`${current.level}:${current.due}`);
    }
    expect(gaps).toEqual([
      '1:2026-11-14',
      '2:2026-11-16',
      '3:2026-11-20',
      '4:2026-11-27',
      '5:2026-12-13',
      '5:2026-12-13',
    ]);
  });
  it('sends a forgotten card back to level 1, due tomorrow', () => {
    expect(reviewCard(card({ level: 4 }), false, today)).toMatchObject({ level: 1, due: '2026-11-14' });
    expect(reviewCard(card({ level: 0 }), false, today)).toMatchObject({ level: 1, due: '2026-11-14' });
  });
  it('lists due and overdue cards, most overdue first', () => {
    const later = card({ id: 'later', due: '2026-11-20' });
    const overdue = card({ id: 'overdue', due: '2026-11-01' });
    const now = card({ id: 'now', due: today });
    expect(dueCards([later, now, overdue], today).map(c => c.id)).toEqual(['overdue', 'now']);
  });
  it('trims input and finds duplicates regardless of case and spacing', () => {
    expect(cleanInput({ word: '  Carry   out ', meaning: ' a ', example: ' b ' })).toEqual({
      word: 'Carry out',
      meaning: 'a',
      example: 'b',
    });
    expect(findWord([card()], 'CARRY  OUT ')?.word).toBe('carry out');
    expect(findWord([card()], 'carry')).toBeUndefined();
  });
});

describe('flashcard backups', () => {
  it('imports backups made before flashcards existed', () => {
    expect(validateData({ schema: 1, attempts: [], saved: [] }).cards).toEqual([]);
  });
  it('round-trips cards and strips unknown properties', () => {
    const saved = { ...card({ id: 'c1', level: 2, due: '2026-11-16' }), lessonId: 'reading-1', extra: 1 };
    const [value] = validateData({ ...emptyData(), cards: [saved] }).cards;
    expect(value).toEqual({ ...card({ id: 'c1', level: 2, due: '2026-11-16' }), lessonId: 'reading-1' });
    expect(value).not.toHaveProperty('extra');
  });
  it('rejects malformed cards and duplicate ids', () => {
    const ok = card({ id: 'c1' });
    expect(() => validateData({ ...emptyData(), cards: {} })).toThrow();
    expect(() => validateData({ ...emptyData(), cards: [ok, ok] })).toThrow();
    expect(() => validateData({ ...emptyData(), cards: [{ ...ok, word: '  ' }] })).toThrow();
    expect(() => validateData({ ...emptyData(), cards: [{ ...ok, level: 6 }] })).toThrow();
    expect(() => validateData({ ...emptyData(), cards: [{ ...ok, due: 'tomorrow' }] })).toThrow();
  });
});
