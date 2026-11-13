import { describe, expect, it } from 'vitest';
import { speakingPlaces, toolGroups } from './tools';

describe('free tools', () => {
  const tools = toolGroups.flatMap(g => g.items);
  it('lists every requested tool once, each with a link, a use and at least one skill', () => {
    expect(new Set(tools.map(t => t.name)).size).toBe(tools.length);
    expect(tools).toHaveLength(11);
    for (const tool of tools) {
      expect(tool.url).toMatch(/^https:\/\//);
      expect(tool.use.length).toBeGreaterThan(10);
      expect(tool.skills.length).toBeGreaterThan(0);
    }
  });
  it('covers the three free speaking options', () => {
    expect(speakingPlaces.map(p => p.title)).toEqual([
      'Nhóm trao đổi ngôn ngữ trên Discord',
      'Câu lạc bộ ngoại ngữ',
      'Học nhóm với bạn bè',
    ]);
  });
});
