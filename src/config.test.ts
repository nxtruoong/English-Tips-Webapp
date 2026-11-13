import { describe, expect, it } from 'vitest';
import { FEEDBACK_FORM_URL, feedbackReady } from './config';

describe('feedback form link', () => {
  it('treats the placeholder as not ready', () => {
    expect(feedbackReady('https://forms.gle/REPLACE_WITH_FEEDBACK_FORM')).toBe(false);
  });
  it('accepts real Google Form links only', () => {
    expect(feedbackReady('https://forms.gle/abc123')).toBe(true);
    expect(feedbackReady('https://docs.google.com/forms/d/e/xyz/viewform')).toBe(true);
    expect(feedbackReady('https://example.com/form')).toBe(false);
  });
  it('is a string constant the team can edit', () => {
    expect(typeof FEEDBACK_FORM_URL).toBe('string');
  });
});
