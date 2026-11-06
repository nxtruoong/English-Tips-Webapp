import { describe, expect, it } from 'vitest';
import { activities } from './activities';

describe('activity content', () => {
  it('gives every image alt text', () => {
    for (const a of activities.filter(a => a.image)) expect(a.imageAlt, a.id).toBeTruthy();
  });
  it('previews at most one activity, using an existing question', () => {
    const previews = activities.filter(a => a.preview);
    expect(previews.length).toBeLessThanOrEqual(1);
    for (const a of previews) {
      expect(a.passage, a.id).toBeTruthy();
      expect(
        a.questions.some(q => q.id === a.preview?.questionId),
        a.id,
      ).toBe(true);
    }
  });
  it('uses unique activity ids', () => {
    expect(new Set(activities.map(a => a.id)).size).toBe(activities.length);
  });
});
