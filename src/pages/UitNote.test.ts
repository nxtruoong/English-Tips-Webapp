import { describe, expect, it } from 'vitest';
import { uitStandard } from './UitNote';

describe('UIT outcome note', () => {
  it('reads the standard-programme TOEIC thresholds from the outcomes data', () => {
    expect(uitStandard).toEqual([
      { label: 'TOEIC Nghe–Đọc', value: 450 },
      { label: 'TOEIC Nói–Viết', value: 185 },
    ]);
  });
});
