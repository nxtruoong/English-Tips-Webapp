import { describe, expect, it } from 'vitest';
import { isCorrect, normalize, score, wordCount } from './domain';
import { activities } from './content/activities';
import { validateData } from './storage';

describe('question-specific evaluation', () => {
  it('accepts case and surrounding whitespace without dropping meaningful words', () => {
    const question = activities[0].questions[0];
    expect(isCorrect(question, '  BRAITHWAITE  ')).toBe(true);
    expect(isCorrect(question, 'Michael Braithwaite')).toBe(false);
  });
  it('normalizes phone spacing only when explicitly allowed', () => {
    expect(isCorrect(activities[0].questions[2], '07700900452')).toBe(true);
    expect(isCorrect(activities[0].questions[2], '07700900453')).toBe(false);
    expect(normalize('not given')).toBe('not given');
    expect(isCorrect(activities[2].questions[2], 'NOTGIVEN')).toBe(false);
  });
  it('keeps printed units and blanks from earning credit', () => {
    expect(isCorrect(activities[0].questions[9], '£60')).toBe(false);
    expect(isCorrect(activities[0].questions[9], '')).toBe(false);
    expect(score(activities[0], {})).toBe(0);
    expect(wordCount('  a\n b  ')).toBe(2);
  });
});
describe('backup validation', () => {
  it('rejects unsupported versions and malformed attempts', () => {
    expect(() => validateData({ schema: 2, attempts: [], saved: [] })).toThrow();
    expect(() => validateData({ schema: 1, attempts: [{}], saved: [] })).toThrow();
  });
  it('strips untrusted properties and rejects duplicate attempt ids', () => {
    const attempt = {
      id: 'a',
      activityId: 'reading-museum',
      version: 1,
      createdAt: '2026-10-29T00:00:00Z',
      updatedAt: '2026-10-29T00:00:00Z',
      responses: {},
      plan: '',
      draft: '',
      revisions: [],
      checks: [],
      revealed: false,
      status: 'draft',
      unexpected: true,
    };
    expect(validateData({ schema: 1, attempts: [attempt], saved: [] }).attempts[0]).not.toHaveProperty(
      'unexpected',
    );
    expect(() => validateData({ schema: 1, attempts: [attempt, attempt], saved: [] })).toThrow();
  });
});
describe('curated content', () => {
  it('has unique activity and question ids, review material, and source references', () => {
    expect(new Set(activities.map(a => a.id)).size).toBe(activities.length);
    for (const activity of activities) {
      expect(activity.source.length).toBeGreaterThan(10);
      expect(new Set(activity.questions.map(q => q.id)).size).toBe(activity.questions.length);
      for (const question of activity.questions) {
        expect(question.accepted.length).toBeGreaterThan(0);
        expect(question.explanation.length).toBeGreaterThan(0);
      }
      if (!activity.questions.length) expect(activity.model?.length).toBeGreaterThan(30);
    }
  });
});
