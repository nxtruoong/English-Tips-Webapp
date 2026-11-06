import { describe, expect, it } from 'vitest';
import { lessons, stages } from './curriculum';
import { validateData } from './storage';
import { sourceSections } from './CourseReader';

describe('source-backed learning sequence', () => {
  it('imports all guide parts with all five nonempty stages', () => {
    expect(lessons).toHaveLength(17);
    expect(lessons.filter(l => l.skill === 'Listening')).toHaveLength(4);
    expect(lessons.filter(l => l.skill === 'Speaking')).toHaveLength(3);
    expect(lessons.filter(l => l.skill === 'Writing')).toHaveLength(2);
    expect(lessons.filter(l => l.skill === 'Reading')).toHaveLength(8);
    for (const lesson of lessons) for (const stage of stages) expect(lesson.stages[stage].length, `${lesson.id}/${stage}`).toBeGreaterThan(0);
  });
  it('keeps Listening theory, guide, E1 drills, full form, and answer key separate', () => {
    const unit = lessons.find(l => l.id === 'listening-1')!;
    expect(JSON.stringify(unit.stages.theory)).toContain('Bản chất');
    expect(JSON.stringify(unit.stages.guide)).toContain('Pre-listening');
    expect(JSON.stringify(unit.stages.small)).toContain('E1');
    expect(unit.stages.full.some(b => b.kind === 'table')).toBe(true);
    expect(JSON.stringify(unit.stages.review)).toContain('Braithwaite');
    expect(JSON.stringify(unit.stages.small)).not.toContain('Đáp án bài tập đầy đủ');
  });
  it('keeps Writing graphics and all Speaking audio groups', () => {
    const writing = lessons.find(l => l.id === 'writing-1')!;
    expect(writing.stages.full.filter(b => b.kind === 'image').length).toBeGreaterThan(20);
    const speaking = lessons.find(l => l.id === 'speaking-2')!;
    expect(speaking.stages.small.filter(b => b.kind === 'audio')).toHaveLength(10);
    expect(speaking.stages.full.filter(b => b.kind === 'audio')).toHaveLength(12);
  });
  it('marks model-essay sections as deliberate reveals rather than open exercises', () => {
    const unit = lessons.find(l => l.id === 'writing-2')!;
    expect(sourceSections(unit.stages.full).some(section => section.model)).toBe(true);
  });
});

describe('lesson progress migration and backups', () => {
  it('loads old backups without losing existing attempt metadata', () => {
    expect(validateData({ schema: 1, attempts: [], saved: ['reading-museum@1/r1'] })).toEqual({ schema: 1, attempts: [], saved: ['reading-museum@1/r1'], lessons: {} });
  });
  it('round-trips stage notes and rejects invalid stage values', () => {
    const lessons = { 'listening-1': { stage: 'small', completed: ['theory','guide'], notes: { 'small/ex1': 'My answers' } } };
    expect(validateData({ schema: 1, attempts: [], saved: [], lessons }).lessons).toEqual(lessons);
    expect(() => validateData({ schema: 1, attempts: [], saved: [], lessons: { 'listening-1': { ...lessons['listening-1'], stage: 'fake' } } })).toThrow();
  });
});
