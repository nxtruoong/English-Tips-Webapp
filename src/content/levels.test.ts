import { describe, expect, it } from 'vitest';
import { levelFromAnswers, levelIds, levelPaths, levelQuestions, suggestedLessons } from './levels';
import { lessonIndex } from '../curriculum';
import { validateData } from '../storage';
import { emptyData } from '../domain';

describe('level suggestions', () => {
  const ids = lessonIndex.map(l => l.id).sort();
  it('orders every lesson exactly once for each level and gives three tips', () => {
    for (const level of levelIds) {
      expect([...levelPaths[level].order].sort()).toEqual(ids);
      expect(levelPaths[level].tips).toHaveLength(3);
    }
  });
  it('starts beginners with everyday listening and speaking', () => {
    expect(suggestedLessons('beginner', {}).slice(0, 2)).toEqual(['listening-1', 'speaking-1']);
  });
  it('puts started lessons first and finished lessons last, without hiding any', () => {
    const progress = {
      'listening-1': {
        stage: 'review' as const,
        completed: [...(['theory', 'guide', 'small', 'full', 'review'] as const)],
        notes: {},
      },
      'reading-6': { stage: 'small' as const, completed: ['theory' as const], notes: {} },
    };
    const order = suggestedLessons('beginner', progress);
    expect(order[0]).toBe('reading-6');
    expect(order.at(-1)).toBe('listening-1');
    expect(order).toHaveLength(ids.length);
  });
  it('keeps the level in backups and accepts backups without one', () => {
    expect(validateData({ ...emptyData(), level: 'advanced' }).level).toBe('advanced');
    expect(validateData({ schema: 1, attempts: [], saved: [] })).not.toHaveProperty('level');
    expect(() => validateData({ ...emptyData(), level: 'expert' })).toThrow();
  });
});

describe('level self-check', () => {
  const answers = (yes: number) => levelQuestions.map((_, i) => i < yes);
  it('maps the number of “yes” answers to a level', () => {
    expect([0, 1, 2, 3, 4, 5].map(n => levelFromAnswers(answers(n)))).toEqual([
      'beginner',
      'beginner',
      'intermediate',
      'intermediate',
      'advanced',
      'advanced',
    ]);
  });
  it('has five questions and two can-do lines per level', () => {
    expect(levelQuestions).toHaveLength(5);
    for (const level of levelIds) expect(levelPaths[level].canDo).toHaveLength(2);
  });
});
