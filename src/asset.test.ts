import { describe, expect, it } from 'vitest';
import { asset } from './asset';

describe('asset', () => {
  it('prefixes public paths with the base URL', () => {
    expect(asset('/media/a.mp3')).toBe(`${import.meta.env.BASE_URL}media/a.mp3`);
    expect(asset('media/a.mp3')).toBe(`${import.meta.env.BASE_URL}media/a.mp3`);
  });
  it('leaves absolute URLs untouched', () => {
    expect(asset('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(asset('data:image/png;base64,AA')).toBe('data:image/png;base64,AA');
  });
});
