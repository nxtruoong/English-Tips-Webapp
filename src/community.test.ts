import { describe, expect, it } from 'vitest';
import { timeAgo } from './community';

describe('timeAgo', () => {
  const now = new Date('2026-11-13T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it('says "vừa xong" for the last minute', () => {
    expect(timeAgo(ago(20_000), now)).toBe('vừa xong');
  });
  it('counts minutes and hours', () => {
    expect(timeAgo(ago(5 * 60_000), now)).toBe('5 phút trước');
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe('3 giờ trước');
  });
  it('uses days within a week, then a date', () => {
    expect(timeAgo(ago(3 * 86_400_000), now)).toBe('3 ngày trước');
    expect(timeAgo(ago(10 * 86_400_000), now)).toMatch(/2026/);
  });
  it('returns an empty string for a bad date', () => {
    expect(timeAgo('not a date', now)).toBe('');
  });
});
