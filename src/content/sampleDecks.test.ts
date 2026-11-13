import { describe, expect, it } from 'vitest';
import { sampleDecks } from './sampleDecks';
import { levelIds } from './levels';
import { addCards, findWord, limits, missingCount, newCard } from '../flashcards';

const today = '2026-11-13';

describe('sample decks', () => {
  it('have unique ids, complete cards and no repeated words', () => {
    expect(new Set(sampleDecks.map(d => d.id)).size).toBe(sampleDecks.length);
    for (const deck of sampleDecks) {
      expect(deck.cards.length).toBeGreaterThanOrEqual(10);
      expect(deck.levels.length).toBeGreaterThan(0);
      expect(deck.levels.every(l => levelIds.includes(l))).toBe(true);
      const words = deck.cards.map(c => c.word.toLocaleLowerCase('en'));
      expect(new Set(words).size).toBe(words.length);
      for (const card of deck.cards) {
        expect(card.word.trim()).toBe(card.word);
        expect(card.meaning.length).toBeGreaterThan(1);
        expect(card.example.length).toBeGreaterThan(10);
        expect(card.word.length).toBeLessThanOrEqual(limits.word);
        expect(card.example.length).toBeLessThanOrEqual(limits.example);
      }
    }
  });
  it('gives every level at least one deck as its main level, and never all of them', () => {
    for (const level of levelIds) {
      const main = sampleDecks.filter(d => d.levels[0] === level).length;
      expect(main).toBeGreaterThan(0);
      expect(main).toBeLessThan(sampleDecks.length);
    }
  });
});

describe('adding a deck', () => {
  const deck = sampleDecks[0].cards;
  it('adds every word once, due today', () => {
    const cards = addCards([], deck, today);
    expect(cards).toHaveLength(deck.length);
    expect(cards.every(c => c.level === 0 && c.due === today)).toBe(true);
    expect(missingCount(cards, deck)).toBe(0);
  });
  it('skips words the learner already has, keeping their version', () => {
    const own = newCard({ word: deck[0].word.toUpperCase(), meaning: 'nghĩa của tôi', example: '' }, today);
    const cards = addCards([own], deck, today);
    expect(cards).toHaveLength(deck.length);
    expect(findWord(cards, deck[0].word)?.meaning).toBe('nghĩa của tôi');
    expect(missingCount([own], deck)).toBe(deck.length - 1);
  });
  it('ignores duplicates and blanks within one batch', () => {
    const batch = [
      deck[0],
      { ...deck[0], word: ` ${deck[0].word} ` },
      { word: '  ', meaning: 'x', example: '' },
    ];
    expect(addCards([], batch, today)).toHaveLength(1);
  });
});
