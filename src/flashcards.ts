// Learner-made vocabulary cards with a simple spaced-repetition schedule.
import { addDays } from './streak';

export interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  /** 0 = new (never reviewed); 1–5 select an interval from `intervals`. */
  level: number;
  /** Day key (YYYY-MM-DD) from which the card is due. */
  due: string;
  createdAt: string;
  /** Lesson the card was added from, if any. */
  lessonId?: string;
}
export type CardInput = Pick<Flashcard, 'word' | 'meaning' | 'example'>;

/** Days until the next review after reaching level 1, 2, 3, 4 and 5. */
export const intervals = [1, 3, 7, 14, 30] as const;
export const maxLevel = intervals.length;
export const limits = { word: 120, meaning: 300, example: 500 } as const;

export function cleanInput(input: CardInput): CardInput {
  return {
    word: input.word.trim().replace(/\s+/g, ' ').slice(0, limits.word),
    meaning: input.meaning.trim().slice(0, limits.meaning),
    example: input.example.trim().slice(0, limits.example),
  };
}

/** A new card is due the day it is added. */
export function newCard(input: CardInput, today: string, lessonId?: string): Flashcard {
  return {
    id: crypto.randomUUID(),
    ...cleanInput(input),
    level: 0,
    due: today,
    createdAt: new Date().toISOString(),
    ...(lessonId ? { lessonId } : {}),
  };
}

/** Remembered: move up one level (capped). Forgotten: back to level 1, due tomorrow. */
export function reviewCard(card: Flashcard, remembered: boolean, today: string): Flashcard {
  const level = remembered ? Math.min(card.level + 1, maxLevel) : 1;
  return { ...card, level, due: addDays(today, intervals[level - 1]) };
}

export const isDue = (card: Flashcard, today: string) => card.due <= today;

/** Due cards, most overdue first, then oldest first. */
export function dueCards(cards: Flashcard[], today: string): Flashcard[] {
  return cards
    .filter(card => isDue(card, today))
    .sort((a, b) => a.due.localeCompare(b.due) || a.createdAt.localeCompare(b.createdAt));
}

export function levelLabel(level: number): string {
  return level === 0 ? 'Mới' : `Mức ${level} · ${intervals[level - 1]} ngày`;
}

/** Same word, ignoring case and spacing, so quick-add does not create duplicates. */
export function findWord(cards: Flashcard[], word: string): Flashcard | undefined {
  const key = cleanInput({ word, meaning: '', example: '' }).word.toLocaleLowerCase('en');
  return cards.find(card => card.word.toLocaleLowerCase('en') === key);
}
