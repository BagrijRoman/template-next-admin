import { describe, expect, it } from 'vitest';
import { formatDate, INVALID_DATE_PLACEHOLDER } from './date';

describe('formatDate', () => {
  it('renders an API timestamp as a short date', () => {
    expect(formatDate('2026-01-31T12:00:00.000Z')).toBe('31 Jan 2026');
  });

  it.each(['', 'yesterday', '2026-13-45'])('falls back to a placeholder for %s', (value) => {
    expect(formatDate(value)).toBe(INVALID_DATE_PLACEHOLDER);
  });
});
